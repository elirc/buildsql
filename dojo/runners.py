"""Gate runners for the non-SQL tracks.

Two jobs, and they pull in opposite directions:

1. The tool's own output *is* the teaching failure message. vitest's diff and
   xUnit's stack trace are better than anything this harness could
   reconstruct, so a normal `dojo test` run streams them straight to the
   terminal, colours and all - nothing is captured or reformatted.
2. The harness still needs to know which exercise passed, so progress,
   `dojo next` and the review ladder keep working. That comes from a machine
   -readable side-channel written by the same run: vitest's JSON reporter to a
   temp file, `dotnet test`'s trx logger to a temp directory.

`dojo verify` flips capture on, because there it is the harness that has to
report, not the learner who is reading along.

Mapping results back to exercises is by naming convention, checked by
`dojo verify`:

    vitest   test title starts with the exercise dir:  test("ex2 - ...", ...)
    xUnit    method name starts with it, PascalCase:   public void Ex2_Whatever()
"""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from pathlib import Path

from dojo import progress, tracks
from dojo.tracks import TRACKS_DIR, Track

#: An exercise dir at the head of a test name. Names are lowercased first, so
#: `Ex2_ReturnsGreeting` and `ex2 - returns a greeting` both yield "ex2".
#: The lookahead is what stops "ex1" matching the head of "ex10".
_EX_KEY = re.compile(r"(ex\d+|challenge|review\d+)(?![a-z0-9])")


def exercise_key(test_name: str) -> str | None:
    m = _EX_KEY.match((test_name or "").strip().lower())
    return m.group(1) if m else None


@dataclass
class RunResult:
    """What one gate invocation produced."""

    exit_code: int
    #: exercise dir -> passed. A dir appearing in several gate files (a
    #: runtime gate and a type gate, say) is ANDed: every gate must pass.
    outcomes: dict[str, bool] = field(default_factory=dict)
    output: str = ""
    #: set when the runner could not run at all (toolchain missing, no gate)
    error: str = ""

    @property
    def ok(self) -> bool:
        return self.exit_code == 0 and not self.error


def merge(outcomes: dict[str, bool], key: str, passed: bool) -> None:
    outcomes[key] = outcomes.get(key, True) and passed


# -- result parsing (pure - unit-tested against canned fixtures) ------------

def parse_vitest_json(text: str) -> dict[str, bool]:
    """vitest's JSON reporter is jest-shaped: testResults[].assertionResults[]."""
    try:
        data = json.loads(text)
    except (ValueError, TypeError):
        return {}
    outcomes: dict[str, bool] = {}
    for file_result in data.get("testResults") or []:
        for assertion in file_result.get("assertionResults") or []:
            key = exercise_key(assertion.get("title") or "")
            if key is None:
                continue
            status = (assertion.get("status") or "").lower()
            if status in {"pending", "skipped", "todo"}:
                continue
            merge(outcomes, key, status == "passed")
    return outcomes


def parse_trx(text: str) -> dict[str, bool]:
    """VSTest's trx is XML; every <UnitTestResult> carries testName + outcome."""
    try:
        root = ET.fromstring(text)
    except ET.ParseError:
        return {}
    outcomes: dict[str, bool] = {}
    for el in root.iter():
        if not el.tag.split("}")[-1] == "UnitTestResult":
            continue
        # "CSharpDojo.Gates.L00_HelloDojoTests.Ex2_Describe(x: 1)" -> "Ex2_Describe"
        method = (el.get("testName") or "").split("(")[0].rsplit(".", 1)[-1]
        key = exercise_key(method)
        if key is None:
            continue
        outcome = (el.get("outcome") or "").lower()
        if outcome in {"notexecuted", "pending", "inconclusive"}:
            continue
        merge(outcomes, key, outcome == "passed")
    return outcomes


# -- progress ---------------------------------------------------------------

def record(track: Track, slug: str, outcomes: dict[str, bool]) -> None:
    """Mirror of conftest.py's pytest hook, for tracks graded outside pytest."""
    if progress.disabled() or not outcomes:
        return
    for exercise_dir, passed in outcomes.items():
        progress.record_outcome(
            track.exercise_id(slug, exercise_dir),
            passed,
            is_review=exercise_dir.startswith("review"),
        )
    spec = track.lesson(slug)
    if spec is None or not spec.review:
        return
    # All core exercises green for the first time -> start the review ladder.
    data = progress.load()
    core_ids = [track.exercise_id(slug, e) for e in spec.core]
    if core_ids and all(progress.passed(data, eid) for eid in core_ids):
        progress.schedule_review(track.exercise_id(slug, "review1"))


# -- process plumbing -------------------------------------------------------

def _executable(name: str) -> str | None:
    """Resolve a tool on PATH. On Windows this hands back npm.cmd/npx.cmd."""
    return shutil.which(name)


def _execute(cmd: list[str], cwd: Path, capture: bool) -> tuple[int, str]:
    """Run a gate. Not capturing is the point: the tool talks to the learner."""
    env = dict(os.environ)
    env.setdefault("FORCE_COLOR", "1")
    if capture:
        env["NO_COLOR"] = "1"
        env.pop("FORCE_COLOR", None)
        proc = subprocess.run(
            cmd, cwd=str(cwd), env=env, capture_output=True,
            text=True, encoding="utf-8", errors="replace",
        )
        return proc.returncode, (proc.stdout or "") + (proc.stderr or "")
    proc = subprocess.run(cmd, cwd=str(cwd), env=env)
    return proc.returncode, ""


class Runner:
    """Base: hold the track, expose run()/setup()."""

    def __init__(self, track: Track):
        self.track = track

    def run(self, slug: str, exercise: str | None = None, *,
            capture: bool = False, record_progress: bool = True) -> RunResult:
        raise NotImplementedError

    def setup(self) -> int:
        raise NotImplementedError

    def _finish(self, slug: str, exercise: str | None, result: RunResult,
                record_progress: bool) -> RunResult:
        if exercise and exercise in result.outcomes:
            # You asked about one exercise, so answer about one exercise. This
            # matters on the TypeScript track, where `tsc` checks a whole file
            # at once: an unfinished ex3 makes the *process* exit nonzero even
            # on a run filtered to ex1, and reporting that as "ex1 failed"
            # would be a lie the learner has no way to see through.
            result.exit_code = 0 if result.outcomes[exercise] else 1
        if record_progress:
            record(self.track, slug, result.outcomes)
        return result


class VitestRunner(Runner):
    """typescript / node / react. One npm install at tracks/ serves all three."""

    @property
    def cli(self) -> Path:
        return TRACKS_DIR / "node_modules" / "vitest" / "vitest.mjs"

    def installed(self) -> bool:
        return self.cli.exists()

    def command(self, slug: str, exercise: str | None, json_path: Path) -> list[str]:
        node = _executable("node") or "node"
        cmd = [node, str(self.cli), "run", f"lessons/{slug}/"]
        if self.track.typecheck:
            cmd.append("--typecheck")
        if exercise:
            # vitest -t is a name filter; our titles start with the exercise dir.
            cmd += ["-t", exercise]
        cmd += [
            "--reporter=default",
            "--reporter=json",
            f"--outputFile.json={json_path.as_posix()}",
        ]
        return cmd

    def run(self, slug, exercise=None, *, capture=False, record_progress=True) -> RunResult:
        if _executable("node") is None:
            return RunResult(1, error=(
                "Node.js is not on PATH. Install Node 22 LTS, then re-run "
                "`uv run dojo doctor`."
            ))
        if not self.installed():
            return RunResult(1, error=(
                f"tracks/node_modules is missing - the {self.track.name} gates cannot run.\n"
                f"  Fix: uv run dojo setup {self.track.name}"
            ))
        gates = self.track.gate_paths(slug)
        if not gates:
            return RunResult(1, error=(
                f"No gate file for {self.track.name}/{slug}.\n"
                f"  Expected: {self.track.lesson_dir(slug).relative_to(TRACKS_DIR.parent)}/gate.test.ts"
            ))

        with tempfile.TemporaryDirectory(prefix="dojo_vitest_") as tmp:
            json_path = Path(tmp) / "results.json"
            code, output = _execute(
                self.command(slug, exercise, json_path), self.track.root, capture
            )
            try:
                report = json_path.read_text(encoding="utf-8")
            except OSError:
                report = ""
        result = RunResult(code, parse_vitest_json(report), output)
        return self._finish(slug, exercise, result, record_progress)

    def setup(self) -> int:
        npm = _executable("npm")
        if npm is None:
            print("npm is not on PATH. Install Node 22 LTS first.")
            return 1
        print(f"npm install in {TRACKS_DIR}  (one install serves typescript, node and react)")
        return subprocess.call([npm, "install", "--no-audit", "--no-fund"], cwd=str(TRACKS_DIR))


class DotnetRunner(Runner):
    """csharp / dotnet. One solution per track; gates are xUnit in tests/Gates."""

    @property
    def solution(self) -> Path:
        matches = sorted(self.track.root.glob("*.sln"))
        return matches[0] if matches else self.track.root

    @property
    def gates_project(self) -> Path:
        return self.track.root / "tests" / "Gates" / "Gates.csproj"

    def filter_for(self, slug: str, exercise: str | None) -> str:
        expr = f"FullyQualifiedName~{self.track.filter_prefix(slug)}"
        if exercise:
            method = exercise[:1].upper() + exercise[1:]
            expr += f"&FullyQualifiedName~{method}"
        return expr

    def command(self, slug: str, exercise: str | None, results_dir: Path) -> list[str]:
        dotnet = _executable("dotnet") or "dotnet"
        return [
            dotnet, "test", str(self.gates_project),
            "--filter", self.filter_for(slug, exercise),
            "--logger", "trx;LogFileName=dojo.trx",
            "--results-directory", str(results_dir),
            "--nologo",
        ]

    def run(self, slug, exercise=None, *, capture=False, record_progress=True) -> RunResult:
        if _executable("dotnet") is None:
            return RunResult(1, error=(
                "The .NET SDK is not on PATH. Install .NET 10, then re-run "
                "`uv run dojo doctor`."
            ))
        if not self.gates_project.exists():
            return RunResult(1, error=f"{self.gates_project} is missing.")
        if not self.track.gate_paths(slug):
            expected = self.track.root / "tests" / "Gates" / f"{tracks.source_folder(slug)}Tests.cs"
            return RunResult(1, error=(
                f"No gate class for {self.track.name}/{slug}.\n  Expected: {expected}"
            ))

        with tempfile.TemporaryDirectory(prefix="dojo_dotnet_") as tmp:
            results_dir = Path(tmp)
            code, output = _execute(
                self.command(slug, exercise, results_dir), self.track.root, capture
            )
            trx = ""
            for path in results_dir.glob("*.trx"):
                try:
                    trx = path.read_text(encoding="utf-8")
                except OSError:
                    trx = ""
                break
        result = RunResult(code, parse_trx(trx), output)
        return self._finish(slug, exercise, result, record_progress)

    def setup(self) -> int:
        dotnet = _executable("dotnet")
        if dotnet is None:
            print("The .NET SDK is not on PATH. Install .NET 10 first.")
            return 1
        print(f"dotnet build {self.solution.name}")
        return subprocess.call([dotnet, "build", str(self.solution), "--nologo"],
                               cwd=str(self.track.root))


def for_track(track: Track) -> Runner:
    if track.runner == tracks.VITEST:
        return VitestRunner(track)
    if track.runner == tracks.DOTNET:
        return DotnetRunner(track)
    raise ValueError(f"track '{track.name}' is graded by pytest, not by a runner")
