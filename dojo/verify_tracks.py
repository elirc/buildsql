"""`dojo verify <track> [lesson]` - prove the non-SQL tracks are solvable.

Same contract as `dojo/verify.py`, different plumbing. Three stages per lesson:

1. **Lint** - no toolchain needed. Manifest and lesson dirs agree, the README
   quotes every gate verbatim, reading.md carries its sections and links,
   hints come in 2-3 tiers, every exercise ships a `.reference/`.
2. **Reference pass** - the author's solutions are overlaid onto the learner
   files and the real gates run: everything must go green.
3. **Pristine fail** - with the shipped stubs back in place, every gate must
   go red. A stub that accidentally passes is a lesson that teaches nothing.

The overlay is the delicate part. JS tracks could be verified in a temp copy,
but the .NET tracks cannot (their files must sit inside the compiled project),
so both use the same mechanism: back the learner's files up to a temp dir,
copy the references in, run, and restore in a `finally` - with an `atexit`
hook armed for the whole window so even a hard crash puts the tree back.
"""
from __future__ import annotations

import atexit
import os
import re
import shutil
import tempfile
from contextlib import contextmanager
from dataclasses import dataclass, field
from pathlib import Path

from rich.console import Console
from rich.table import Table

from dojo import runners, tracks
from dojo.config import ROOT
from dojo.tracks import Track
from dojo.verify import _hint_sections, lint_reading

#: A test declaration in a gate file, per runner. The last group is the name
#: that must start with an exercise dir; the whole matched text is the snippet
#: the README has to quote verbatim.
_VITEST_DECL = re.compile(r"""^[ \t]*(?:it|test)(?:\.\w+)?\s*\(\s*(["'`])([^"'`]+)\1""", re.M)
_XUNIT_DECL = re.compile(r"^[ \t]*public\s+(?:static\s+|async\s+)*[\w<>\[\], ]+?\s+(\w+)\s*\(", re.M)


@dataclass
class LessonResult:
    slug: str
    lint_errors: list[str] = field(default_factory=list)
    reference_ok: bool | None = None
    pristine_ok: bool | None = None
    detail: str = ""

    @property
    def ok(self) -> bool:
        return (not self.lint_errors
                and self.reference_ok is not False
                and self.pristine_ok is not False)


# -- gate discovery ---------------------------------------------------------

def gate_declarations(track: Track, slug: str) -> dict[str, list[str]]:
    """exercise dir -> the source lines in the gate files that grade it.

    Those lines are what `README.md` must quote, and their existence is what
    proves every manifest exercise is actually graded by something.
    """
    pattern = _VITEST_DECL if track.runner == tracks.VITEST else _XUNIT_DECL
    found: dict[str, list[str]] = {}
    for path in track.gate_paths(slug):
        try:
            src = path.read_text(encoding="utf-8")
        except OSError:
            continue
        for match in pattern.finditer(src):
            key = runners.exercise_key(match.group(match.re.groups))
            if key is None:
                continue
            line = src[match.start():match.end()].strip()
            found.setdefault(key, []).append(line)
    return found


def _rel(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return str(path)


# -- lint -------------------------------------------------------------------

def lint_lesson(track: Track, spec) -> list[str]:
    errors: list[str] = []
    ldir = track.lesson_dir(spec.slug)
    if not ldir.is_dir():
        return [f"lesson dir {_rel(ldir)} missing (manifest lists it, nothing on disk)"]

    gates = track.gate_paths(spec.slug)
    if not gates:
        want = ("gate.test.ts / gate.test.tsx" if track.runner == tracks.VITEST
                else f"tests/Gates/{tracks.source_folder(spec.slug)}Tests.cs")
        return [f"no gate file for this lesson (expected {want})"]

    readme_path = ldir / "README.md"
    readme = readme_path.read_text(encoding="utf-8") if readme_path.exists() else ""
    if not readme.strip():
        errors.append("README.md missing or empty")

    manifest_dirs = set(spec.exercise_dirs())
    actual_dirs = {
        p.name for p in ldir.iterdir()
        if p.is_dir() and re.fullmatch(r"ex\d+|challenge|review\d+", p.name)
    }
    for d in sorted(manifest_dirs - actual_dirs):
        errors.append(f"manifest exercise '{d}' has no directory")
    for d in sorted(actual_dirs - manifest_dirs):
        errors.append(f"directory '{d}' not in {_rel(track.manifest_path)}")

    declarations = gate_declarations(track, spec.slug)
    for d in sorted(manifest_dirs - set(declarations)):
        errors.append(f"no gate test named '{d}...' in {', '.join(_rel(g) for g in gates)}")
    for d in sorted(set(declarations) - manifest_dirs):
        errors.append(f"gate tests '{d}...' exist but the manifest has no such exercise")

    errors += lint_reading(spec, ldir)

    for d in sorted(manifest_dirs & actual_dirs):
        errors += _lint_exercise(track, spec, d, readme, declarations)
    return errors


def _lint_exercise(track: Track, spec, d: str, readme: str,
                   declarations: dict[str, list[str]]) -> list[str]:
    errors: list[str] = []
    exd = track.lesson_dir(spec.slug) / d

    hints = exd / "hints.md"
    if not hints.exists():
        errors.append(f"{d}/hints.md missing")
    else:
        n = len(_hint_sections(hints.read_text(encoding="utf-8")))
        if not 2 <= n <= 3:
            errors.append(f"{d}/hints.md has {n} '## Hint N' sections (need 2-3)")

    ref = exd / ".reference"
    ref_files = sorted(p for p in ref.iterdir() if p.is_file()) if ref.is_dir() else []
    if not ref_files:
        errors.append(f"{d}/.reference/ has no solution files")
    for f in ref_files:
        learner = track.learner_file(spec.slug, d, f.name)
        if not learner.exists():
            errors.append(
                f"{d}/.reference/{f.name} has no learner file to overlay "
                f"(expected {_rel(learner)})"
            )

    if readme:
        for line in declarations.get(d, []):
            if line not in readme:
                errors.append(
                    f"README does not quote the gate for {d} (missing the line "
                    f"`{line[:70]}`)"
                )
                break
    return errors


# -- the reference overlay --------------------------------------------------

def _install(source: Path, target: Path) -> None:
    """Copy source over target and stamp it as modified *now*.

    The timestamp is not a detail. MSBuild decides whether to recompile by
    comparing file mtimes against the last build's output, and shutil.copy2
    faithfully preserves the source's mtime - which meant an overlaid
    reference solution older than the previous build was silently not
    compiled, and the gates graded the stubs while reporting on the
    references. Bump the mtime on the way in *and* on the way out.
    """
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
    os.utime(target, None)


@contextmanager
def reference_overlay(track: Track, spec):
    """Swap the author's `.reference/` files in, and always put them back."""
    staging = Path(tempfile.mkdtemp(prefix="dojo_overlay_"))
    #: (learner file, backup copy or None if the file did not exist)
    swapped: list[tuple[Path, Path | None]] = []

    def restore() -> None:
        while swapped:
            target, backup = swapped.pop()
            try:
                if backup is None:
                    target.unlink(missing_ok=True)
                else:
                    _install(backup, target)
            except OSError:
                pass
        shutil.rmtree(staging, ignore_errors=True)

    atexit.register(restore)
    try:
        for d in spec.exercise_dirs():
            refdir = track.lesson_dir(spec.slug) / d / ".reference"
            if not refdir.is_dir():
                continue
            for f in sorted(refdir.iterdir()):
                if not f.is_file():
                    continue
                target = track.learner_file(spec.slug, d, f.name)
                if target.exists():
                    backup = staging / f"{d}__{f.name}"
                    shutil.copyfile(target, backup)
                    swapped.append((target, backup))
                else:
                    swapped.append((target, None))
                _install(f, target)
        yield
    finally:
        restore()
        atexit.unregister(restore)


# -- running ----------------------------------------------------------------

def _expected_dirs(spec) -> list[str]:
    return list(spec.exercise_dirs())


def _summarise(result: runners.RunResult, spec, want_pass: bool) -> tuple[bool, str]:
    """Did every manifest exercise land on the expected side?"""
    if result.error:
        return False, result.error
    problems = []
    for d in _expected_dirs(spec):
        got = result.outcomes.get(d)
        if got is None:
            problems.append(f"  {d}: the gate reported no result for this exercise")
        elif got is not want_pass:
            problems.append(
                f"  {d}: {'FAILED' if not got else 'PASSED'} "
                f"(expected it to {'pass' if want_pass else 'fail'})"
            )
    if want_pass and result.exit_code != 0 and not problems:
        problems.append(f"  the runner exited {result.exit_code} with no failing exercise "
                        f"- a build error or a gate outside the manifest?")
    if not problems:
        return True, ""
    return False, "\n".join(problems) + "\n\n" + result.output[-6000:]


def verify_lesson(track: Track, spec, console: Console) -> LessonResult:
    res = LessonResult(spec.slug)
    res.lint_errors = lint_lesson(track, spec)
    if res.lint_errors:
        return res

    runner = runners.for_track(track)

    with reference_overlay(track, spec):
        ref_run = runner.run(spec.slug, capture=True, record_progress=False)
    res.reference_ok, detail = _summarise(ref_run, spec, want_pass=True)
    if not res.reference_ok:
        res.detail = "reference solutions did not all pass:\n" + detail
        return res

    pristine = runner.run(spec.slug, capture=True, record_progress=False)
    res.pristine_ok, detail = _summarise(pristine, spec, want_pass=False)
    if not res.pristine_ok:
        res.detail = "shipped stubs did not all fail:\n" + detail
    return res


# -- entry point ------------------------------------------------------------

def main(track: Track, target: str | None = None) -> int:
    console = Console()
    specs = track.all_lessons()
    if not specs:
        console.print(f"[red]{_rel(track.manifest_path)} lists no lessons.[/red]")
        return 1

    if target:
        slug = track.resolve_slug(target)
        specs = [s for s in specs if s.slug == slug] if slug else []
        if not specs:
            # An unknown slug is still worth linting if the manifest knows it.
            specs = [s for s in track.all_lessons() if s.slug.startswith(target)]
        if not specs:
            console.print(
                f"[red]No lesson matching '{target}' in the {track.name} track.[/red] "
                f"Try `uv run dojo status {track.name}`."
            )
            return 1
        existing, missing = specs, []
    else:
        existing = [s for s in specs if track.lesson_dir(s.slug).is_dir()]
        missing = [s for s in specs if not track.lesson_dir(s.slug).is_dir()]
        if missing:
            console.print(
                f"[yellow]{len(missing)}/{len(specs)} {track.name} lessons not authored "
                f"yet (skipped): {', '.join(s.slug for s in missing[:5])}"
                + (" ..." if len(missing) > 5 else "") + "[/yellow]"
            )
        if not existing:
            console.print(f"[yellow]Nothing to verify in the {track.name} track yet.[/yellow]")
            return 0

    previous = os.environ.get("DOJO_NO_PROGRESS")
    os.environ["DOJO_NO_PROGRESS"] = "1"
    os.environ.setdefault("DOJO_NO_READING", "1")
    results: list[LessonResult] = []
    try:
        for spec in existing:
            console.print(f"verifying [bold]{track.name}/{spec.slug}[/bold] ...", highlight=False)
            results.append(verify_lesson(track, spec, console))
    finally:
        if previous is None:
            os.environ.pop("DOJO_NO_PROGRESS", None)
        else:
            os.environ["DOJO_NO_PROGRESS"] = previous

    table = Table(title=f"dojo verify {track.name}")
    table.add_column("lesson")
    table.add_column("lint")
    table.add_column("reference")
    table.add_column("pristine stubs")
    ok = True
    for r in results:
        lint = "[green]ok[/green]" if not r.lint_errors else f"[red]{len(r.lint_errors)} errors[/red]"
        ref = {True: "[green]pass[/green]", False: "[red]FAIL[/red]", None: "-"}[r.reference_ok]
        pri = {True: "[green]fails as shipped[/green]", False: "[red]BAD[/red]", None: "-"}[r.pristine_ok]
        table.add_row(r.slug, lint, ref, pri)
        if not r.ok:
            ok = False
    console.print(table)

    for r in results:
        for e in r.lint_errors:
            console.print(f"[red]{r.slug}: {e}[/red]")
        if r.detail:
            console.print(f"[red]--- {track.name}/{r.slug} ---[/red]\n{r.detail}")
    if ok:
        console.print(f"[green]verify: all {len(results)} {track.name} lesson(s) green[/green]")
    return 0 if ok else 1
