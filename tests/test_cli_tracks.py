"""CLI wiring: the resolution rule, and that bare SQL usage is untouched.

The guarantee under test is narrow and important: adding five tracks must not
change one character of what `dojo test 08_inner_joins ex2` does.
"""
from __future__ import annotations

import argparse

import pytest

from dojo import cli, tracks


@pytest.fixture()
def parse(monkeypatch):
    """Drive the real `dojo` argparse setup and hand back the namespace.

    Goes through `cli.main()` rather than a hand-built parser, so a change to
    the subcommand definitions is caught here rather than in production.
    """
    import sys

    def _parse(command: str, argv: list[str]) -> argparse.Namespace:
        captured = {}

        def capture(ns):
            captured["ns"] = ns
            return 0

        monkeypatch.setattr(sys, "argv", ["dojo", command, *argv])
        monkeypatch.setattr(cli, f"cmd_{command}", capture)
        with pytest.raises(SystemExit) as exit_info:
            cli.main()
        assert exit_info.value.code == 0
        return captured["ns"]

    return _parse


@pytest.mark.parametrize("argv,track,slug,exercise", [
    # bare SQL - exactly as it has always worked
    (["08_inner_joins", "ex2"], "sql", "08_inner_joins", "ex2"),
    (["08_inner_joins"], "sql", "08_inner_joins", None),
    (["08", "challenge"], "sql", "08_inner_joins", "challenge"),
    (["47"], "sql", "47_capstone", None),
    # tracks, by name and by alias
    (["typescript", "00_hello_dojo", "ex1"], "typescript", "00_hello_dojo", "ex1"),
    (["ts", "00", "ex3"], "typescript", "00_hello_dojo", "ex3"),
    (["cs", "00"], "csharp", "00_hello_dojo", None),
    (["net", "05"], "dotnet", "05_efcore_basics", None),
    (["react", "09_context_reducer"], "react", "09_context_reducer", None),
])
def test_target_resolution(parse, argv, track, slug, exercise):
    ns = parse("test", argv)
    got_track, rest = tracks.resolve(ns.target)
    assert got_track.name == track
    assert cli._lesson_and_exercise(got_track, rest) == (slug, exercise)


def test_sql_pytest_arguments_are_unchanged(monkeypatch):
    calls = []

    class FakePytest:
        @staticmethod
        def main(args):
            calls.append(list(args))
            return 0

    monkeypatch.setitem(__import__("sys").modules, "pytest", FakePytest)
    monkeypatch.chdir(__import__("dojo.config", fromlist=["ROOT"]).ROOT)

    cli._test_sql("08_inner_joins", "ex2", no_read=True)
    cli._test_sql("08_inner_joins", None, no_read=True)

    assert calls[0] == ["lessons/08_inner_joins/test_lesson.py::test_ex2",
                        "-q", "--no-header", "-p", "no:cacheprovider"]
    assert calls[1] == ["lessons/08_inner_joins/test_lesson.py", "-m", "not review",
                        "-q", "--no-header", "-p", "no:cacheprovider"]


def test_verify_without_a_track_still_means_sql(monkeypatch):
    seen = []
    monkeypatch.setattr("dojo.verify.main", lambda slug=None: seen.append(slug) or 0)
    cli.cmd_verify(argparse.Namespace(target=["08_inner_joins"]))
    cli.cmd_verify(argparse.Namespace(target=[]))
    assert seen == ["08_inner_joins", None]


def test_verify_with_a_track_goes_to_the_track_verifier(monkeypatch):
    seen = []
    monkeypatch.setattr("dojo.verify_tracks.main",
                        lambda track, target=None: seen.append((track.name, target)) or 0)
    cli.cmd_verify(argparse.Namespace(target=["typescript", "00_hello_dojo"]))
    cli.cmd_verify(argparse.Namespace(target=["cs"]))
    assert seen == [("typescript", "00_hello_dojo"), ("csharp", None)]


def test_an_unknown_lesson_is_a_clean_error_not_a_crash():
    track = tracks.get("typescript")
    assert cli._lesson_and_exercise(track, ["99_nope"]) is None
    assert cli._lesson_and_exercise(track, []) is None
    assert cli._lesson_and_exercise(track, ["00", "ex1", "extra"]) is None


def test_hint_requires_an_exercise():
    track = tracks.get("typescript")
    assert cli._lesson_and_exercise(track, ["00"], need_exercise=True) is None
    assert cli._lesson_and_exercise(track, ["00", "ex1"], need_exercise=True) == (
        "00_hello_dojo", "ex1")


def test_next_names_a_file_and_a_command_for_every_track(capsys):
    """`dojo next <track>` must be actionable even for unauthored lessons."""
    data = {"exercises": {}, "reviews": {}}
    for track in tracks.REGISTRY:
        found = cli._first_incomplete(track, data)
        assert found is not None, track.name
        cli._next_detail(track, *found)
    out = capsys.readouterr().out
    for track in tracks.REGISTRY:
        prefix = "" if track.is_sql else f"{track.name} "
        assert f"uv run dojo test {prefix}00_hello_dojo ex1" in out.replace("\n", " ")
