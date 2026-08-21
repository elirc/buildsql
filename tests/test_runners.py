"""Runner result parsing, against canned vitest-JSON and trx fixtures.

No toolchain needed: these are the exact shapes vitest's JSON reporter and
VSTest's trx logger produce, captured from real runs.
"""
from __future__ import annotations

import json

import pytest

from dojo import runners, tracks

# -- name -> exercise key ---------------------------------------------------

@pytest.mark.parametrize("name,key", [
    ("ex1 - greet() builds a greeting", "ex1"),
    ("ex10 - the tenth one", "ex10"),
    ("Ex2_DescribeAgreesWithItsOwnNumber", "ex2"),
    ("challenge - the hard one", "challenge"),
    ("Challenge_FiveTableReport", "challenge"),
    ("review1 - same idea, fresh shape", "review1"),
    ("Review1_SameIdea", "review1"),
    ("  ex3: parses the slug  ", "ex3"),
    ("ex4", "ex4"),
])
def test_exercise_key_extraction(name, key):
    assert runners.exercise_key(name) == key


@pytest.mark.parametrize("name", [
    "", "the api boots and answers health", "TheApiBoots",
    "ex1narrows the union",  # no separator: the convention is violated
    "setup - not an exercise",
])
def test_names_that_are_not_exercises(name):
    assert runners.exercise_key(name) is None


def test_ex1_does_not_swallow_ex10():
    assert runners.exercise_key("ex10 - ...") == "ex10"
    assert runners.exercise_key("ex1 - ...") == "ex1"


# -- vitest JSON ------------------------------------------------------------

def _vitest_report(*files):
    return json.dumps({"numTotalTests": 0, "success": False, "testResults": list(files)})


def _file(name, *assertions):
    return {
        "name": name,
        "assertionResults": [
            {"title": t, "fullName": t, "status": s, "ancestorTitles": ["00_hello_dojo"]}
            for t, s in assertions
        ],
    }


VITEST_PRISTINE = _vitest_report(
    _file("/tracks/typescript/lessons/00_hello_dojo/gate.test.ts",
          ("ex1 - greet() builds a greeting from a name", "failed"),
          ("ex2 - describeTrack() agrees with its own number", "failed"),
          ("ex3 - parseLessonNumber() returns a number, not a string", "failed")),
    _file("/tracks/typescript/lessons/00_hello_dojo/gate.test-d.ts",
          ("ex1 - greet() is (name: string) => string", "passed"),
          ("ex3 - parseLessonNumber() is declared to return a number", "failed")),
)

VITEST_REFERENCE = _vitest_report(
    _file("/tracks/typescript/lessons/00_hello_dojo/gate.test.ts",
          ("ex1 - greet() builds a greeting from a name", "passed"),
          ("ex2 - describeTrack() agrees with its own number", "passed"),
          ("ex3 - parseLessonNumber() returns a number, not a string", "passed")),
    _file("/tracks/typescript/lessons/00_hello_dojo/gate.test-d.ts",
          ("ex1 - greet() is (name: string) => string", "passed"),
          ("ex3 - parseLessonNumber() is declared to return a number", "passed")),
)


def test_parse_vitest_json_reference_run():
    assert runners.parse_vitest_json(VITEST_REFERENCE) == {
        "ex1": True, "ex2": True, "ex3": True
    }


def test_parse_vitest_json_ands_results_across_gate_files():
    """ex1's type gate passes but its runtime gate fails: the exercise failed."""
    assert runners.parse_vitest_json(VITEST_PRISTINE) == {
        "ex1": False, "ex2": False, "ex3": False
    }


def test_parse_vitest_json_ignores_skipped_tests():
    """A filtered run (`-t ex1`) marks the others pending; they are not verdicts."""
    report = _vitest_report(_file(
        "gate.test.ts",
        ("ex1 - ...", "failed"),
        ("ex2 - ...", "pending"),
        ("ex3 - ...", "skipped"),
    ))
    assert runners.parse_vitest_json(report) == {"ex1": False}


def test_parse_vitest_json_ignores_tests_that_are_not_exercises():
    report = _vitest_report(_file("gate.test.ts",
                                  ("the harness itself works", "passed"),
                                  ("ex1 - ...", "passed")))
    assert runners.parse_vitest_json(report) == {"ex1": True}


@pytest.mark.parametrize("text", ["", "not json at all", "{}", '{"testResults": null}'])
def test_parse_vitest_json_survives_a_missing_or_broken_report(text):
    assert runners.parse_vitest_json(text) == {}


# -- trx --------------------------------------------------------------------

TRX_HEAD = (
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<TestRun id="x" xmlns="http://microsoft.com/schemas/VisualStudio/TeamTest/2010">\n'
    "<Results>\n"
)
TRX_TAIL = "</Results>\n</TestRun>\n"


def _trx(*results):
    rows = "".join(
        f'<UnitTestResult testName="{name}" outcome="{outcome}" duration="00:00:00.01" />\n'
        for name, outcome in results
    )
    return TRX_HEAD + rows + TRX_TAIL


TRX_PRISTINE = _trx(
    ("CSharpDojo.Gates.L00_HelloDojoTests.Ex1_GreetBuildsAGreetingFromAName", "Failed"),
    ("CSharpDojo.Gates.L00_HelloDojoTests.Ex2_DescribeAgreesWithItsOwnNumber", "Failed"),
    ("CSharpDojo.Gates.L00_HelloDojoTests.Ex3_LessonNumberReturnsAnInt", "Failed"),
)

TRX_REFERENCE = _trx(
    ("CSharpDojo.Gates.L00_HelloDojoTests.Ex1_GreetBuildsAGreetingFromAName", "Passed"),
    ("CSharpDojo.Gates.L00_HelloDojoTests.Ex2_DescribeAgreesWithItsOwnNumber", "Passed"),
    ("CSharpDojo.Gates.L00_HelloDojoTests.Ex3_LessonNumberReturnsAnInt", "Passed"),
)


def test_parse_trx_reference_run():
    assert runners.parse_trx(TRX_REFERENCE) == {"ex1": True, "ex2": True, "ex3": True}


def test_parse_trx_pristine_run():
    assert runners.parse_trx(TRX_PRISTINE) == {"ex1": False, "ex2": False, "ex3": False}


def test_parse_trx_strips_theory_arguments_from_the_method_name():
    trx = _trx(("CSharpDojo.Gates.L02_ControlFlowTests.Ex3_Fizzbuzz(n: 15)", "Passed"),
               ("CSharpDojo.Gates.L02_ControlFlowTests.Ex3_Fizzbuzz(n: 7)", "Failed"))
    assert runners.parse_trx(trx) == {"ex3": False}


def test_parse_trx_ignores_the_harness_smoke_test():
    trx = _trx(("DotnetDojo.Gates.HarnessSmokeTests.TheApiBootsAndAnswersHealth", "Passed"),
               ("DotnetDojo.Gates.L01_RoutingTests.Ex1_ReturnsTheOrder", "Passed"))
    assert runners.parse_trx(trx) == {"ex1": True}


def test_parse_trx_ignores_not_executed_results():
    trx = _trx(("X.L00_Tests.Ex1_Thing", "Passed"), ("X.L00_Tests.Ex2_Thing", "NotExecuted"))
    assert runners.parse_trx(trx) == {"ex1": True}


@pytest.mark.parametrize("text", ["", "<not-xml", "<TestRun/>"])
def test_parse_trx_survives_a_missing_or_broken_report(text):
    assert runners.parse_trx(text) == {}


# -- command construction ---------------------------------------------------

def test_vitest_command_targets_the_lesson_and_asks_for_json(tmp_path):
    runner = runners.VitestRunner(tracks.get("typescript"))
    cmd = runner.command("04_unions_narrowing", None, tmp_path / "r.json")
    assert cmd[1].endswith("vitest.mjs")
    assert "run" in cmd
    assert "lessons/04_unions_narrowing/" in cmd
    assert "--typecheck" in cmd  # the TS track grades types too
    assert any(c.startswith("--outputFile.json=") for c in cmd)
    assert "-t" not in cmd


def test_vitest_command_filters_by_exercise(tmp_path):
    runner = runners.VitestRunner(tracks.get("node"))
    cmd = runner.command("02_event_loop", "ex3", tmp_path / "r.json")
    assert cmd[cmd.index("-t") + 1] == "ex3"
    assert "--typecheck" not in cmd  # only the TS track type-checks


def test_dotnet_filter_narrows_to_the_lesson_then_the_exercise():
    runner = runners.DotnetRunner(tracks.get("csharp"))
    assert runner.filter_for("10_linq_1", None) == "FullyQualifiedName~L10_"
    assert runner.filter_for("10_linq_1", "ex2") == (
        "FullyQualifiedName~L10_&FullyQualifiedName~Ex2"
    )
    assert runner.filter_for("00_hello_dojo", "challenge") == (
        "FullyQualifiedName~L00_&FullyQualifiedName~Challenge"
    )


def test_dotnet_command_writes_a_trx(tmp_path):
    runner = runners.DotnetRunner(tracks.get("dotnet"))
    cmd = runner.command("01_routing_endpoints", None, tmp_path)
    assert cmd[1] == "test"
    assert "--logger" in cmd
    assert cmd[cmd.index("--logger") + 1].startswith("trx;")
    assert str(tmp_path) in cmd


def test_for_track_picks_the_right_runner():
    assert isinstance(runners.for_track(tracks.get("react")), runners.VitestRunner)
    assert isinstance(runners.for_track(tracks.get("net")), runners.DotnetRunner)
    with pytest.raises(ValueError):
        runners.for_track(tracks.get("sql"))


# -- progress recording -----------------------------------------------------

def test_record_is_a_no_op_when_progress_is_disabled(monkeypatch):
    """Every grading run `dojo verify` makes must leave progress.json alone."""
    monkeypatch.setenv("DOJO_NO_PROGRESS", "1")
    calls = []
    monkeypatch.setattr("dojo.progress.record_outcome",
                        lambda *a, **k: calls.append(a))
    runners.record(tracks.get("typescript"), "00_hello_dojo", {"ex1": True})
    assert calls == []


def test_record_writes_track_prefixed_ids(monkeypatch):
    monkeypatch.delenv("DOJO_NO_PROGRESS", raising=False)
    calls = []
    monkeypatch.setattr("dojo.progress.record_outcome",
                        lambda eid, passed, is_review: calls.append((eid, passed, is_review)))
    monkeypatch.setattr("dojo.progress.load", lambda: {"exercises": {}, "reviews": {}})
    monkeypatch.setattr("dojo.progress.passed", lambda data, eid: False)
    runners.record(tracks.get("csharp"), "00_hello_dojo", {"ex1": True, "review1": False})
    assert ("csharp/00_hello_dojo::ex1", True, False) in calls
    assert ("csharp/00_hello_dojo::review1", False, True) in calls


def test_record_starts_the_review_ladder_when_every_core_exercise_passes(monkeypatch):
    monkeypatch.delenv("DOJO_NO_PROGRESS", raising=False)
    scheduled = []
    monkeypatch.setattr("dojo.progress.record_outcome", lambda *a, **k: None)
    monkeypatch.setattr("dojo.progress.load", lambda: {"exercises": {}, "reviews": {}})
    monkeypatch.setattr("dojo.progress.passed", lambda data, eid: True)
    monkeypatch.setattr("dojo.progress.schedule_review",
                        lambda rid, today=None: scheduled.append(rid))
    ts = tracks.get("typescript")
    runners.record(ts, "01_primitives_and_inference", {"ex1": True})
    assert scheduled == ["typescript/01_primitives_and_inference::review1"]


def test_record_does_not_schedule_reviews_for_lessons_without_one(monkeypatch):
    monkeypatch.delenv("DOJO_NO_PROGRESS", raising=False)
    scheduled = []
    monkeypatch.setattr("dojo.progress.record_outcome", lambda *a, **k: None)
    monkeypatch.setattr("dojo.progress.load", lambda: {"exercises": {}, "reviews": {}})
    monkeypatch.setattr("dojo.progress.passed", lambda data, eid: True)
    monkeypatch.setattr("dojo.progress.schedule_review",
                        lambda rid, today=None: scheduled.append(rid))
    runners.record(tracks.get("typescript"), "00_hello_dojo", {"ex1": True})
    assert scheduled == []
