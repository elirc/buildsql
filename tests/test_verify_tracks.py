"""verify_tracks lint rules and the reference overlay, on a synthetic lesson.

Everything here runs against a temp track built in tmp_path - no npm, no
dotnet, no network. The real end-to-end proof is `dojo verify typescript
00_hello_dojo`, which is an authoring-time command, not a unit test.
"""
from __future__ import annotations

import textwrap

import pytest

from dojo import tracks, verify_tracks
from dojo.curriculum import LessonSpec

GATE = '''\
import { describe, expect, test } from "vitest";

import { widen } from "./ex1/solution";

describe("00_mini", () => {
  test("ex1 - widen() doubles", () => {
    expect(widen(2), "reread README ex1").toBe(4);
  });
});
'''

README = """\
# 00 — Mini

Prose that motivates the concept.

## Exercise 1

Edit `ex1/solution.ts`.

## The gate

```ts
  test("ex1 - widen() doubles", () => {
```
"""

READING = """\
# Reading - 00_mini

## Notes

A block of theory long enough to clear the twenty-five word floor that the
linter enforces, because a section that says TODO is worse than no section at
all and the floor is what stops that happening in the first place.

## ex1 — what this was really testing

Another block of theory long enough to clear the twenty-five word floor,
explaining the idea behind the exercise, the mental model it depends on, and
the classic mistake people make on their first attempt at it.

## Further reading

- [Handbook](https://www.typescriptlang.org/docs/) — the official docs.
- [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) — annotations and inference.
- [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript) — the JavaScript underneath.
"""

HINTS = """\
## Hint 1

Restate the problem in your own words. No syntax yet.

## Hint 2

The approach: which construct to reach for, and why that one.
"""


@pytest.fixture()
def mini(tmp_path):
    """A synthetic single-lesson vitest track, complete and lint-clean."""
    root = tmp_path / "mini"
    lesson = root / "lessons" / "00_mini"
    (lesson / "ex1" / ".reference").mkdir(parents=True)
    (lesson / "gate.test.ts").write_text(GATE, encoding="utf-8")
    (lesson / "README.md").write_text(README, encoding="utf-8")
    (lesson / "reading.md").write_text(READING, encoding="utf-8")
    (lesson / "ex1" / "hints.md").write_text(HINTS, encoding="utf-8")
    (lesson / "ex1" / "solution.ts").write_text(
        "export function widen(n: number): number {\n  throw new Error('todo');\n}\n",
        encoding="utf-8")
    (lesson / "ex1" / ".reference" / "solution.ts").write_text(
        "export function widen(n: number): number {\n  return n * 2;\n}\n",
        encoding="utf-8")
    (root / "curriculum.py").write_text(textwrap.dedent("""
        from dojo.curriculum import LessonSpec
        PARTS = [("Part 0", [LessonSpec("00_mini", ("ex1",))])]
    """), encoding="utf-8")
    track = tracks.Track("mini", (), root, tracks.VITEST, "a synthetic track",
                         stub_name="solution.ts")
    tracks.clear_cache()
    yield track
    tracks.clear_cache()


SPEC = LessonSpec("00_mini", ("ex1",))


# -- the happy path ---------------------------------------------------------

def test_a_complete_lesson_lints_clean(mini):
    assert verify_tracks.lint_lesson(mini, SPEC) == []


def test_gate_declarations_are_found_and_keyed_by_exercise(mini):
    found = verify_tracks.gate_declarations(mini, "00_mini")
    assert list(found) == ["ex1"]
    assert 'test("ex1 - widen() doubles"' in found["ex1"][0]


# -- each lint rule, one at a time ------------------------------------------

def test_a_manifest_lesson_with_no_directory_is_a_lint_error(mini):
    errors = verify_tracks.lint_lesson(mini, LessonSpec("07_ghost", ("ex1",)))
    assert len(errors) == 1
    assert "missing" in errors[0]
    assert "07_ghost" in errors[0]


def test_a_manifest_exercise_with_no_directory_is_caught(mini):
    errors = verify_tracks.lint_lesson(mini, LessonSpec("00_mini", ("ex1", "ex2")))
    assert any("manifest exercise 'ex2' has no directory" in e for e in errors)


def test_an_exercise_with_no_gate_test_is_caught(mini):
    errors = verify_tracks.lint_lesson(mini, LessonSpec("00_mini", ("ex1",), challenge=True))
    assert any("no gate test named 'challenge...'" in e for e in errors)


def test_a_gate_test_with_no_manifest_exercise_is_caught(mini):
    gate = mini.lesson_dir("00_mini") / "gate.test.ts"
    gate.write_text(gate.read_text(encoding="utf-8").replace(
        "});\n", '  test("ex9 - stray", () => {});\n});\n', 1), encoding="utf-8")
    errors = verify_tracks.lint_lesson(mini, SPEC)
    assert any("ex9" in e and "manifest has no such exercise" in e for e in errors)


def test_a_readme_that_does_not_quote_the_gate_is_caught(mini):
    (mini.lesson_dir("00_mini") / "README.md").write_text(
        "# 00 — Mini\n\nProse, but no gate quoted.\n", encoding="utf-8")
    errors = verify_tracks.lint_lesson(mini, SPEC)
    assert any("does not quote the gate for ex1" in e for e in errors)


def test_a_missing_readme_is_caught(mini):
    (mini.lesson_dir("00_mini") / "README.md").unlink()
    errors = verify_tracks.lint_lesson(mini, SPEC)
    assert any("README.md missing or empty" in e for e in errors)


@pytest.mark.parametrize("n_hints,ok", [(1, False), (2, True), (3, True), (4, False)])
def test_hints_must_come_in_two_or_three_tiers(mini, n_hints, ok):
    text = "".join(f"## Hint {i}\n\nA tier of guidance.\n\n" for i in range(1, n_hints + 1))
    (mini.lesson_dir("00_mini") / "ex1" / "hints.md").write_text(text, encoding="utf-8")
    errors = verify_tracks.lint_lesson(mini, SPEC)
    assert (not any("hints.md" in e for e in errors)) is ok


def test_a_missing_hints_file_is_caught(mini):
    (mini.lesson_dir("00_mini") / "ex1" / "hints.md").unlink()
    errors = verify_tracks.lint_lesson(mini, SPEC)
    assert any("ex1/hints.md missing" in e for e in errors)


def test_an_empty_reference_dir_is_caught(mini):
    (mini.lesson_dir("00_mini") / "ex1" / ".reference" / "solution.ts").unlink()
    errors = verify_tracks.lint_lesson(mini, SPEC)
    assert any(".reference/ has no solution files" in e for e in errors)


def test_a_reference_with_no_learner_file_is_caught(mini):
    (mini.lesson_dir("00_mini") / "ex1" / ".reference" / "stray.ts").write_text(
        "export const x = 1;\n", encoding="utf-8")
    errors = verify_tracks.lint_lesson(mini, SPEC)
    assert any("has no learner file to overlay" in e for e in errors)


def test_reading_sections_and_link_floors_are_enforced(mini):
    reading = mini.lesson_dir("00_mini") / "reading.md"
    reading.write_text("# Reading\n\n## Notes\n\nToo short.\n", encoding="utf-8")
    errors = verify_tracks.lint_lesson(mini, SPEC)
    assert any("'## Notes' is only" in e for e in errors)
    assert any("no '## Further reading' section" in e for e in errors)
    assert any("no '## ex1' section" in e for e in errors)


def test_a_missing_reading_file_is_caught(mini):
    (mini.lesson_dir("00_mini") / "reading.md").unlink()
    errors = verify_tracks.lint_lesson(mini, SPEC)
    assert any("reading.md missing" in e for e in errors)


# -- the overlay ------------------------------------------------------------

def _stub(mini):
    return (mini.lesson_dir("00_mini") / "ex1" / "solution.ts").read_text(encoding="utf-8")


def test_the_overlay_swaps_references_in_and_puts_the_stubs_back(mini):
    before = _stub(mini)
    assert "throw" in before

    with verify_tracks.reference_overlay(mini, SPEC):
        assert "return n * 2" in _stub(mini)

    assert _stub(mini) == before


def test_the_overlay_restores_even_when_the_body_raises(mini):
    """A crash mid-verify must never leave the learner's tree holding answers."""
    before = _stub(mini)
    with pytest.raises(RuntimeError):
        with verify_tracks.reference_overlay(mini, SPEC):
            assert "return n * 2" in _stub(mini)
            raise RuntimeError("boom")
    assert _stub(mini) == before


def test_the_overlay_bumps_the_mtime(mini):
    """MSBuild rebuilds on mtime; copy2 would preserve it and grade stale code."""
    target = mini.lesson_dir("00_mini") / "ex1" / "solution.ts"
    import os

    os.utime(target, (0, 0))
    with verify_tracks.reference_overlay(mini, SPEC):
        assert target.stat().st_mtime > 1_000_000
    assert target.stat().st_mtime > 1_000_000


def test_the_overlay_removes_files_that_did_not_exist_before(mini):
    """A reference for a file the learner has not created yet leaves no trace."""
    ref = mini.lesson_dir("00_mini") / "ex1" / ".reference" / "helper.ts"
    ref.write_text("export const help = 1;\n", encoding="utf-8")
    target = mini.lesson_dir("00_mini") / "ex1" / "helper.ts"
    assert not target.exists()
    with verify_tracks.reference_overlay(mini, SPEC):
        assert target.exists()
    assert not target.exists()


# -- result summarising -----------------------------------------------------

def test_summarise_accepts_a_clean_reference_run():
    result = __import__("dojo.runners", fromlist=["x"]).RunResult(0, {"ex1": True})
    ok, detail = verify_tracks._summarise(result, SPEC, want_pass=True)
    assert ok and detail == ""


def test_summarise_rejects_an_exercise_with_no_verdict():
    from dojo.runners import RunResult

    ok, detail = verify_tracks._summarise(RunResult(0, {}), SPEC, want_pass=True)
    assert not ok
    assert "no result for this exercise" in detail


def test_summarise_rejects_a_stub_that_passes():
    from dojo.runners import RunResult

    ok, detail = verify_tracks._summarise(RunResult(0, {"ex1": True}), SPEC, want_pass=False)
    assert not ok
    assert "expected it to fail" in detail


def test_summarise_reports_a_runner_that_could_not_start():
    from dojo.runners import RunResult

    ok, detail = verify_tracks._summarise(
        RunResult(1, {}, error="tracks/node_modules is missing"), SPEC, want_pass=True)
    assert not ok
    assert "node_modules" in detail
