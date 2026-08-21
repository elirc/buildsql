"""`dojo verify` - prove every exercise is solvable.

For each lesson: lint the tree, then run the real gates twice in a temp copy
of the lesson tree - once with the author's .reference/ solutions (must all
pass) and once with pristine stubs (must all fail). Never touches the working
tree or the learner's progress (DOJO_NO_PROGRESS=1).
"""
from __future__ import annotations

import os
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

from rich.console import Console
from rich.table import Table

from dojo import curriculum
from dojo.config import ROOT

STUB_FILES = ["solution.sql", "indexes.sql"]


@dataclass
class LessonResult:
    slug: str
    lint_errors: list[str] = field(default_factory=list)
    reference_ok: bool | None = None
    pristine_ok: bool | None = None
    detail: str = ""

    @property
    def ok(self) -> bool:
        return not self.lint_errors and self.reference_ok is not False and self.pristine_ok is not False


def _hint_sections(text: str) -> list[str]:
    return re.findall(r"^## Hint \d+", text, flags=re.M)


MIN_READING_LINKS = 3
# A floor that catches empty/TODO sections without forcing prose to be padded.
MIN_SECTION_WORDS = 25


def lint_reading(spec: curriculum.LessonSpec, ldir: Path) -> list[str]:
    """Every lesson owes the learner theory notes and links, per exercise."""
    from dojo import reading as reading_mod

    errors: list[str] = []
    path = ldir / "reading.md"
    if not path.exists():
        return ["reading.md missing (theory notes + further reading)"]
    doc = reading_mod.parse(path.read_text(encoding="utf-8"), spec.slug, path)

    if doc.notes is None:
        errors.append("reading.md has no '## Notes' section")
    elif len(doc.notes.body.split()) < MIN_SECTION_WORDS:
        errors.append(
            f"reading.md '## Notes' is only {len(doc.notes.body.split())} words "
            f"(need >= {MIN_SECTION_WORDS})"
        )

    further = doc.further_reading
    if further is None:
        errors.append("reading.md has no '## Further reading' section")
    else:
        n = len(re.findall(r"\[[^\]]+\]\(https?://[^)\s]+\)", further.body))
        if n < MIN_READING_LINKS:
            errors.append(
                f"reading.md '## Further reading' has {n} link(s) "
                f"(need >= {MIN_READING_LINKS})"
            )

    have = set(doc.exercise_keys())
    for d in spec.exercise_dirs():
        if d not in have:
            errors.append(f"reading.md has no '## {d}' section")
        else:
            section = doc.get(d)
            if len(section.body.split()) < MIN_SECTION_WORDS:
                errors.append(
                    f"reading.md '## {d}' is only {len(section.body.split())} words "
                    f"(need >= {MIN_SECTION_WORDS})"
                )
    for extra in sorted(have - set(spec.exercise_dirs())):
        errors.append(f"reading.md section '## {extra}' has no manifest exercise")
    return errors


def lint_lesson(spec: curriculum.LessonSpec) -> list[str]:
    errors: list[str] = []
    ldir = ROOT / "lessons" / spec.slug
    if not ldir.is_dir():
        return [f"lesson dir lessons/{spec.slug} missing"]
    test_file = ldir / "test_lesson.py"
    if not test_file.exists():
        return ["test_lesson.py missing"]
    test_src = test_file.read_text(encoding="utf-8")
    readme_path = ldir / "README.md"
    readme = readme_path.read_text(encoding="utf-8") if readme_path.exists() else ""
    if not readme:
        errors.append("README.md missing or empty")

    manifest_dirs = set(spec.exercise_dirs())
    actual_dirs = {
        p.name for p in ldir.iterdir()
        if p.is_dir() and re.fullmatch(r"ex\d+|challenge|review\d+", p.name)
    }
    for d in sorted(manifest_dirs - actual_dirs):
        errors.append(f"manifest exercise '{d}' has no directory")
    for d in sorted(actual_dirs - manifest_dirs):
        errors.append(f"directory '{d}' not in curriculum manifest")

    test_funcs = set(re.findall(r"^def (test_\w+)\(", test_src, flags=re.M))
    expected_funcs = {spec.test_name(d) for d in spec.exercise_dirs()}
    for f in sorted(expected_funcs - test_funcs):
        errors.append(f"test function {f} missing from test_lesson.py")
    for f in sorted(test_funcs - expected_funcs):
        errors.append(f"test function {f} has no manifest exercise")

    errors += lint_reading(spec, ldir)

    for d in sorted(manifest_dirs & actual_dirs):
        exd = ldir / d
        hints = exd / "hints.md"
        if not hints.exists():
            errors.append(f"{d}/hints.md missing")
        else:
            n = len(_hint_sections(hints.read_text(encoding="utf-8")))
            if not 2 <= n <= 3:
                errors.append(f"{d}/hints.md has {n} '## Hint N' sections (need 2-3)")
        ref = exd / ".reference"
        if not (ref / "solution.sql").exists() and not (ref / "indexes.sql").exists():
            errors.append(f"{d}/.reference/ has no solution")
        for stub in STUB_FILES:
            if (exd / stub).exists() and not (ref / stub).exists():
                errors.append(f"{d}/.reference/{stub} missing (stub {stub} exists)")
        fn = spec.test_name(d)
        if readme and f"def {fn}(" not in readme:
            errors.append(f"README does not quote the gate for {d} (missing 'def {fn}(')")
    return errors


def _run_pytest(tmp: Path, slug: str) -> tuple[int, int, int, str]:
    """Run the lesson's tests in tmp; return (exit_code, passed, failed, output)."""
    env = dict(os.environ, DOJO_NO_PROGRESS="1", DOJO_NO_READING="1")
    proc = subprocess.run(
        [sys.executable, "-m", "pytest",
         f"lessons/{slug}/test_lesson.py",
         "-q", "--no-header", "-p", "no:cacheprovider", "--tb=short"],
        cwd=tmp, env=env, capture_output=True, text=True,
    )
    out = proc.stdout + proc.stderr
    passed = sum(int(m) for m in re.findall(r"(\d+) passed", out))
    failed = sum(int(m) for m in re.findall(r"(\d+) (?:failed|error)", out))
    return proc.returncode, passed, failed, out


def _make_tree(tmp: Path, spec: curriculum.LessonSpec, use_reference: bool) -> None:
    if tmp.exists():
        shutil.rmtree(tmp)
    (tmp / "lessons").mkdir(parents=True)
    shutil.copy(ROOT / "conftest.py", tmp / "conftest.py")
    shutil.copy(ROOT / "pyproject.toml", tmp / "pyproject.toml")
    src = ROOT / "lessons" / spec.slug
    dst = tmp / "lessons" / spec.slug
    shutil.copytree(src, dst)
    if use_reference:
        for d in spec.exercise_dirs():
            ref = dst / d / ".reference"
            if ref.is_dir():
                for f in ref.iterdir():
                    shutil.copy(f, dst / d / f.name)


def verify_lesson(spec: curriculum.LessonSpec, workdir: Path, console: Console) -> LessonResult:
    res = LessonResult(spec.slug)
    res.lint_errors = lint_lesson(spec)
    if res.lint_errors:
        return res

    tmp = workdir / spec.slug
    n_tests = len(spec.exercise_dirs())

    _make_tree(tmp, spec, use_reference=True)
    code, passed, failed, out = _run_pytest(tmp, spec.slug)
    res.reference_ok = code == 0 and failed == 0
    if not res.reference_ok:
        res.detail = out[-4000:]
        return res

    _make_tree(tmp, spec, use_reference=False)
    code, passed, failed, out = _run_pytest(tmp, spec.slug)
    # pristine stubs must fail their gates: nothing may pass
    res.pristine_ok = passed == 0 and failed > 0
    if not res.pristine_ok:
        res.detail = f"pristine stubs: {passed} passed, {failed} failed (expected 0 passed)\n" + out[-2000:]
    shutil.rmtree(tmp, ignore_errors=True)
    return res


def lint_manifest() -> list[str]:
    errors = []
    slugs = {spec.slug for spec in curriculum.all_lessons()}
    lessons_dir = ROOT / "lessons"
    if lessons_dir.is_dir():
        on_disk = {p.name for p in lessons_dir.iterdir() if p.is_dir()}
        for s in sorted(on_disk - slugs):
            errors.append(f"lessons/{s} exists but is not in the curriculum manifest")
    return errors


def main(target: str | None = None) -> int:
    console = Console()
    specs = curriculum.all_lessons()
    if target:
        specs = [s for s in specs if s.slug == target or s.slug.startswith(target)]
        if not specs:
            console.print(f"[red]No lesson matching '{target}'[/red]")
            return 1

    manifest_errors = lint_manifest() if target is None else []
    existing = [s for s in specs if (ROOT / "lessons" / s.slug).is_dir()]
    missing = [s for s in specs if not (ROOT / "lessons" / s.slug).is_dir()]
    if target is None and missing:
        console.print(
            f"[yellow]{len(missing)} manifest lessons not authored yet "
            f"(skipped): {', '.join(s.slug for s in missing[:5])}"
            + (" ..." if len(missing) > 5 else "") + "[/yellow]"
        )

    results: list[LessonResult] = []
    workdir = Path(tempfile.mkdtemp(prefix="dojo_verify_"))
    try:
        for spec in existing:
            console.print(f"verifying [bold]{spec.slug}[/bold] ...", highlight=False)
            results.append(verify_lesson(spec, workdir, console))
    finally:
        shutil.rmtree(workdir, ignore_errors=True)

    table = Table(title="dojo verify")
    table.add_column("lesson")
    table.add_column("lint")
    table.add_column("reference")
    table.add_column("pristine stubs")
    ok = not manifest_errors
    for r in results:
        lint = "[green]ok[/green]" if not r.lint_errors else f"[red]{len(r.lint_errors)} errors[/red]"
        ref = {True: "[green]pass[/green]", False: "[red]FAIL[/red]", None: "-"}[r.reference_ok]
        pri = {True: "[green]fails as shipped[/green]", False: "[red]BAD[/red]", None: "-"}[r.pristine_ok]
        table.add_row(r.slug, lint, ref, pri)
        if not r.ok:
            ok = False
    console.print(table)
    for e in manifest_errors:
        console.print(f"[red]manifest: {e}[/red]")
    for r in results:
        for e in r.lint_errors:
            console.print(f"[red]{r.slug}: {e}[/red]")
        if r.detail:
            console.print(f"[red]--- {r.slug} ---[/red]\n{r.detail}")
    if ok:
        console.print(f"[green]verify: all {len(results)} lesson(s) green[/green]")
    return 0 if ok else 1
