"""The `dojo` CLI - primary interface to the course.

Six tracks share this one command. The resolution rule is a single line: if
the first positional argument names a track (or one of its aliases) it selects
that track and is consumed; otherwise you get the SQL track and nothing is
consumed. So `dojo test 08_inner_joins ex2` means exactly what it has always
meant, and `dojo test typescript 04_unions ex2` is the same sentence with a
track in front of it.
"""
from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

from rich.console import Console
from rich.markdown import Markdown
from rich.table import Table
from rich.tree import Tree

from dojo import curriculum, progress, tracks
from dojo.config import ROOT
from dojo.tracks import Track

if sys.platform == "win32":
    # A cp1252 console can't encode the stars/arrows used in the readings and
    # crashes rich with UnicodeEncodeError. Re-encode as UTF-8 (replacing what
    # the terminal truly can't show) before the Console below binds to stdout.
    for _stream in (sys.stdout, sys.stderr):
        try:
            _stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, OSError):
            pass

console = Console()


def _resolve_slug(name: str) -> str | None:
    """Accept '08', '08_inner_joins', or 'inner_joins'-ish prefixes."""
    for spec in curriculum.all_lessons():
        if spec.slug == name or spec.slug.startswith(name):
            return spec.slug
    return None


def _split(target: list[str] | None) -> tuple[Track, list[str]]:
    return tracks.resolve(list(target or []))


def _lesson_and_exercise(track: Track, rest: list[str], need_exercise: bool = False):
    """Shared argument handling for test/hint/read. Returns (slug, exercise) or None."""
    if not rest:
        console.print(
            f"[red]Which lesson?[/red] Try: [bold]uv run dojo next"
            f"{'' if track.is_sql else ' ' + track.name}[/bold]"
        )
        return None
    if len(rest) > 2:
        console.print(f"[red]Too many arguments: {' '.join(rest)}[/red]")
        return None
    slug = track.resolve_slug(rest[0])
    if not slug:
        console.print(
            f"[red]No lesson matching '{rest[0]}' in the {track.name} track.[/red] "
            f"Try `uv run dojo status{'' if track.is_sql else ' ' + track.name}`."
        )
        return None
    exercise = rest[1] if len(rest) > 1 else None
    if need_exercise and not exercise:
        spec = track.lesson(slug)
        dirs = ", ".join(spec.exercise_dirs()) if spec else "ex1"
        console.print(f"[red]Which exercise?[/red] {slug} has: {dirs}")
        return None
    return slug, exercise


def _compose(*args: str) -> int:
    return subprocess.call(["docker", "compose", *args], cwd=ROOT)


def _rel(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return str(path)


# -- commands ---------------------------------------------------------------

def cmd_up(_):
    return _compose("up", "-d")


def cmd_down(_):
    return _compose("down")


def cmd_seed(_):
    from dojo.seed import seed

    seed()
    return 0


def cmd_test(args):
    track, rest = _split(args.target)
    parsed = _lesson_and_exercise(track, rest)
    if parsed is None:
        return 1
    slug, exercise = parsed
    if track.is_sql:
        return _test_sql(slug, exercise, args.no_read)
    return _test_track(track, slug, exercise, args.no_read)


def _test_sql(slug: str, exercise: str | None, no_read: bool) -> int:
    pytest_args = [f"lessons/{slug}/test_lesson.py"]
    if exercise:
        pytest_args[0] += f"::test_{exercise}"
    else:
        pytest_args += ["-m", "not review"]
    pytest_args += ["-q", "--no-header", "-p", "no:cacheprovider"]
    import pytest

    os.chdir(ROOT)
    code = pytest.main(pytest_args)
    if not no_read:
        from dojo import reading

        reading.button(slug, exercise, passed=(code == 0), console=console)
    return code


def _test_track(track: Track, slug: str, exercise: str | None, no_read: bool) -> int:
    from dojo import reading, runners

    runner = runners.for_track(track)
    result = runner.run(slug, exercise)
    if result.error:
        console.print(f"[red]{result.error}[/red]")
        return result.exit_code or 1

    if result.outcomes:
        marks = "  ".join(
            f"[green]v[/green] {d}" if ok else f"[red]x[/red] {d}"
            for d, ok in sorted(result.outcomes.items())
        )
        console.print(f"\n[bold]{track.name}/{slug}[/bold]  {marks}")
    if not no_read:
        reading.button(slug, exercise, passed=(result.exit_code == 0),
                       console=console, track=track)
    return result.exit_code


def cmd_read(args):
    track, rest = _split(args.target)
    parsed = _lesson_and_exercise(track, rest)
    if parsed is None:
        return 1
    slug, exercise = parsed
    from dojo import reading

    rc = reading.render(slug, exercise, console=console, track=track)
    if rc == 0:
        spec = track.lesson(slug)
        ex_id = (track.exercise_id(slug, exercise) if (spec and exercise)
                 else f"{'' if track.is_sql else track.name + '/'}{slug}")
        progress.record_reading(ex_id)
    return rc


def cmd_hint(args):
    track, rest = _split(args.target)
    parsed = _lesson_and_exercise(track, rest, need_exercise=True)
    if parsed is None:
        return 1
    slug, exercise = parsed

    hints_path = track.lesson_dir(slug) / exercise / "hints.md"
    if not hints_path.exists():
        console.print(f"[red]No hints for {track.name}/{slug}/{exercise}.[/red] "
                      f"[dim]Expected {_rel(hints_path)}[/dim]")
        return 1
    text = hints_path.read_text(encoding="utf-8")
    tiers = [t.strip() for t in re.split(r"^## Hint \d+\s*$", text, flags=re.M)[1:]]
    if not tiers:
        console.print("[red]hints.md has no '## Hint N' sections.[/red]")
        return 1

    ex_id = track.exercise_id(slug, exercise)
    data = progress.load()
    used = data["exercises"].get(ex_id, {}).get("hints_used", 0)

    if used >= len(tiers):
        console.print(f"[bold]All {len(tiers)} hints for {slug}/{exercise}:[/bold]\n")
        for i, t in enumerate(tiers, 1):
            console.print(f"[bold cyan]Hint {i}[/bold cyan]")
            console.print(Markdown(t))
            console.print()
        _reading_pointer(track, slug, exercise)
        return 0

    tier = used + 1
    console.print(f"[bold cyan]Hint {tier} of {len(tiers)}[/bold cyan] "
                  f"({slug}/{exercise})\n")
    console.print(Markdown(tiers[tier - 1]))
    progress.record_hint(ex_id, tier)
    if tier < len(tiers):
        console.print(f"\n[dim]{len(tiers) - tier} more hint(s) available - "
                      f"run the same command again if you need them.[/dim]")
    else:
        _reading_pointer(track, slug, exercise)
    return 0


def _reading_pointer(track: Track, slug: str, exercise: str) -> None:
    """Out of hints is exactly when the theory is worth reading."""
    from dojo import reading

    if reading.load(slug, track) is None:
        return
    prefix = reading.command_prefix(track)
    console.print(
        f"\n[dim]Out of hints? The idea behind this problem is written up in "
        f"full:[/dim]\n  [bold]uv run dojo read {prefix}{slug} {exercise}[/bold]"
    )


# -- status / next ----------------------------------------------------------

def _track_tree(track: Track, data: dict, due: list[str]) -> tuple[Tree, int, int]:
    total_core = passed_core = 0
    tree = Tree(f"[bold]{track.name}[/bold] [dim]- {track.title}[/dim]")
    for part_name, lessons in track.parts():
        part_node = tree.add(f"[bold]{part_name}[/bold]")
        for spec in lessons:
            icons = []
            lesson_hints = lesson_reads = 0
            for exdir in spec.core:
                ex_id = track.exercise_id(spec.slug, exdir)
                st = data["exercises"].get(ex_id, {})
                lesson_hints += st.get("hints_used", 0)
                lesson_reads += st.get("readings_opened", 0)
                total_core += 1
                if st.get("passed_at"):
                    passed_core += 1
                    icons.append(f"[green]v[/green] {exdir}")
                elif st.get("attempts"):
                    icons.append(f"[yellow]~[/yellow] {exdir}")
                else:
                    icons.append(f"[dim]o[/dim] {exdir}")
            extra = []
            if spec.challenge:
                st = data["exercises"].get(track.exercise_id(spec.slug, "challenge"), {})
                lesson_hints += st.get("hints_used", 0)
                lesson_reads += st.get("readings_opened", 0)
                mark = "[green]v[/green]" if st.get("passed_at") else (
                    "[yellow]~[/yellow]" if st.get("attempts") else "[dim]o[/dim]")
                extra.append(f"{mark} challenge")
            if spec.review:
                rid = track.exercise_id(spec.slug, "review1")
                rev = data["reviews"].get(rid)
                if rev:
                    tag = "[red]due[/red]" if rid in due else f"due {rev['due']}"
                    extra.append(f"review ({tag})")
                else:
                    extra.append("[dim]review (unscheduled)[/dim]")
            notes = []
            if lesson_hints:
                notes.append(f"{lesson_hints} hint(s) used")
            if lesson_reads:
                notes.append(f"{lesson_reads} reading(s) opened")
            note = f"  [dim]{', '.join(notes)}[/dim]" if notes else ""
            part_node.add(f"{spec.slug}  " + "  ".join(icons + extra) + note)
    return tree, passed_core, total_core


def cmd_status(args):
    track, rest = _split(args.target)
    show_all = not args.target
    if rest and not show_all:
        console.print(f"[red]Unknown track '{rest[0]}'.[/red] Run `uv run dojo tracks`.")
        return 1

    data = progress.load()
    due = progress.reviews_due(data, date.today())
    targets = list(tracks.REGISTRY) if show_all else [track]

    grand_passed = grand_total = 0
    trees = []
    for t in targets:
        tree, passed, total = _track_tree(t, data, due)
        grand_passed += passed
        grand_total += total
        pct = (100 * passed // total) if total else 0
        trees.append((t, tree, passed, total, pct))

    if show_all:
        pct = (100 * grand_passed // grand_total) if grand_total else 0
        console.print(
            f"[bold]Dojo: {grand_passed}/{grand_total} core exercises across "
            f"{len(targets)} tracks ({pct}%)  |  reviews due today: {len(due)}[/bold]"
        )
    console.print(
        "[dim]legend: [green]v[/green] passed   [yellow]~[/yellow] attempted   "
        "[dim]o[/dim] not started[/dim]\n"
    )
    for t, tree, passed, total, pct in trees:
        console.print(f"[bold]{t.name}: {passed}/{total} core exercises ({pct}%)[/bold]")
        console.print(tree)
        console.print()
    return 0


def _first_incomplete(track: Track, data: dict):
    for spec in track.all_lessons():
        for exdir in spec.core:
            if not progress.passed(data, track.exercise_id(spec.slug, exdir)):
                return spec, exdir
    return None


def _next_detail(track: Track, spec, exdir: str) -> None:
    prefix = "" if track.is_sql else f"{track.name} "
    files = track.learner_files(spec.slug, exdir)
    edit = "\n         ".join(_rel(f) for f in files) or "(not authored yet)"
    console.print(
        f"Next up: [bold]{track.name}[/bold] / [bold]{spec.slug}[/bold] "
        f"exercise [bold]{exdir}[/bold]\n"
        f"  read:  {_rel(track.lesson_dir(spec.slug) / 'README.md')}\n"
        f"  edit:  {edit}\n"
        f"  run:   uv run dojo test {prefix}{spec.slug} {exdir}\n"
        f"  after: uv run dojo read {prefix}{spec.slug} {exdir}   [dim](the theory, "
        f"also offered automatically after grading)[/dim]"
    )


def cmd_next(args):
    track, rest = _split(args.target)
    show_all = not args.target
    if rest and not show_all:
        console.print(f"[red]Unknown track '{rest[0]}'.[/red] Run `uv run dojo tracks`.")
        return 1

    data = progress.load()
    due = progress.reviews_due(data)

    if not show_all:
        found = _first_incomplete(track, data)
        if found is None:
            console.print(f"[green]All core exercises in the {track.name} track are "
                          f"passed. You have finished it.[/green]")
        else:
            _next_detail(track, *found)
        if due:
            console.print(f"\nAlso: [yellow]{len(due)} review(s) due[/yellow] - `uv run dojo review`")
        return 0

    for t in tracks.REGISTRY:
        found = _first_incomplete(t, data)
        prefix = "" if t.is_sql else f"{t.name} "
        if found is None:
            console.print(f"  [green]{t.name:<11}[/green] finished")
            continue
        spec, exdir = found
        console.print(
            f"  [bold]{t.name:<11}[/bold] {spec.slug} {exdir}"
            f"   [dim]uv run dojo test {prefix}{spec.slug} {exdir}[/dim]"
        )
    console.print("\n[dim]Detail for one track: uv run dojo next <track>[/dim]")
    if due:
        console.print(f"[yellow]{len(due)} review(s) due[/yellow] - `uv run dojo review`")
    return 0


def cmd_tracks(_):
    data = progress.load()
    due = progress.reviews_due(data)
    table = Table(title="dojo tracks")
    table.add_column("track")
    table.add_column("aliases")
    table.add_column("lessons", justify="right")
    table.add_column("authored", justify="right")
    table.add_column("core", justify="right")
    table.add_column("done", justify="right")
    table.add_column("what it teaches", overflow="fold")
    for t in tracks.REGISTRY:
        specs = t.all_lessons()
        core_ids = [t.exercise_id(s.slug, e) for s in specs for e in s.core]
        done = sum(1 for i in core_ids if progress.passed(data, i))
        authored = sum(1 for s in specs if t.lesson_dir(s.slug).is_dir())
        pct = (100 * done // len(core_ids)) if core_ids else 0
        table.add_row(
            t.name,
            ", ".join(t.aliases) or "-",
            str(len(specs)),
            f"{authored}/{len(specs)}",
            str(len(core_ids)),
            f"{done} ({pct}%)",
            t.title,
        )
    console.print(table)
    console.print(
        "\n[dim]Any command takes a track as its first word:[/dim]\n"
        "  [bold]uv run dojo next typescript[/bold]        what to do next there\n"
        "  [bold]uv run dojo test cs 03_classes ex2[/bold]  grade one exercise (aliases work)\n"
        "  [bold]uv run dojo status[/bold]                  every track at once"
    )
    if due:
        console.print(f"\n[yellow]{len(due)} review(s) due[/yellow] - `uv run dojo review`")
    return 0


def cmd_setup(args):
    track = tracks.get(args.track)
    if track is None:
        console.print(f"[red]Unknown track '{args.track}'.[/red] Run `uv run dojo tracks`.")
        return 1
    if track.is_sql:
        console.print(
            "The SQL track's setup is the database:\n"
            "  [bold]uv run dojo up[/bold]     start PostgreSQL in Docker\n"
            "  [bold]uv run dojo seed[/bold]   build the template database\n"
            "  [bold]uv run dojo doctor[/bold] check it worked"
        )
        return 0
    from dojo import runners

    return runners.for_track(track).setup()


# -- review -----------------------------------------------------------------

def cmd_review(args):
    data = progress.load()
    due = progress.reviews_due(data)
    if not due:
        console.print("No reviews due today.")
        return 0

    grouped: dict[str, list[tuple[Track, str, str]]] = {}
    for rid in due:
        parsed = tracks.parse_exercise_id(rid)
        if parsed is None:
            continue
        track, slug, exdir = parsed
        grouped.setdefault(track.name, []).append((track, slug, exdir))

    if args.action != "run":
        console.print(f"[bold]{len(due)} review(s) due:[/bold]")
        for name, items in grouped.items():
            for track, slug, exdir in items:
                rid = track.exercise_id(slug, exdir)
                console.print(f"  {name:<11} {slug}  ({exdir})  - due {data['reviews'][rid]['due']}")
        console.print("\nRun them: uv run dojo review run")
        return 0

    worst = 0
    for name, items in grouped.items():
        track = items[0][0]
        if track.is_sql:
            node_ids = [f"lessons/{slug}/test_lesson.py::test_{exdir}"
                        for _, slug, exdir in items]
            import pytest

            os.chdir(ROOT)
            code = pytest.main(node_ids + ["-m", "review", "-q", "--no-header",
                                           "-p", "no:cacheprovider"])
            worst = worst or code
            if len(items) == 1:
                from dojo import reading

                reading.button(items[0][1], items[0][2], passed=(code == 0), console=console)
            continue

        from dojo import runners

        runner = runners.for_track(track)
        for _, slug, exdir in items:
            console.print(f"[bold]{name}/{slug} {exdir}[/bold]")
            result = runner.run(slug, exdir)
            if result.error:
                console.print(f"[red]{result.error}[/red]")
            worst = worst or (result.exit_code or 0)
    return worst


# -- SQL-only commands (unchanged) ------------------------------------------

def cmd_plan(args):
    slug = _resolve_slug(args.lesson)
    if not slug:
        console.print(f"[red]No lesson matching '{args.lesson}'.[/red]")
        return 1
    from dojo.plan_lesson import show_plan

    return show_plan(slug, args.exercise or "ex1")


def cmd_lab(args):
    from dojo import lab

    if args.clean:
        lab.clean()
        return 0
    if not args.lesson:
        console.print("[red]Usage: dojo lab <lesson>  |  dojo lab --clean[/red]")
        return 1
    slug = _resolve_slug(args.lesson)
    if not slug:
        console.print(f"[red]No lesson matching '{args.lesson}'.[/red]")
        return 1
    return lab.lab(slug)


def cmd_reset_baseline(_):
    from dojo import timing

    if timing.reset_baselines():
        console.print("Deleted data/baseline.json - speed targets recalibrate on next run.")
    else:
        console.print("No baseline file to delete.")
    return 0


def cmd_doctor(_):
    from dojo import doctor

    return doctor.run()


def cmd_verify(args):
    track, rest = _split(args.target)
    if len(rest) > 1:
        console.print(f"[red]Too many arguments: {' '.join(rest)}[/red]")
        return 1
    target = rest[0] if rest else None

    if track.is_sql:
        from dojo import verify

        slug = _resolve_slug(target) if target else None
        if target and not slug:
            console.print(f"[red]No lesson matching '{target}'.[/red]")
            return 1
        return verify.main(slug)

    from dojo import verify_tracks

    return verify_tracks.main(track, target)


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="dojo",
        description="Dojo course harness - sql, typescript, node, react, csharp, dotnet",
        epilog="Any of test/hint/read/status/next/verify takes an optional track name "
               "as its first argument; without one you get the SQL track.",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("up", help="start the PostgreSQL container").set_defaults(fn=cmd_up)
    sub.add_parser("down", help="stop the PostgreSQL container").set_defaults(fn=cmd_down)
    sub.add_parser("seed", help="build the template database").set_defaults(fn=cmd_seed)
    sub.add_parser("tracks", help="list the tracks and your progress in each").set_defaults(
        fn=cmd_tracks
    )

    p = sub.add_parser("test", help="run a lesson's gate: [track] <lesson> [exercise]")
    p.add_argument("target", nargs="*", metavar="ARG")
    p.add_argument("--no-read", action="store_true",
                   help="skip the reading prompt shown after grading")
    p.set_defaults(fn=cmd_test)

    p = sub.add_parser("hint", help="reveal the next hint tier: [track] <lesson> <exercise>")
    p.add_argument("target", nargs="*", metavar="ARG")
    p.set_defaults(fn=cmd_hint)

    p = sub.add_parser("read", help="the theory: [track] <lesson> [exercise]")
    p.add_argument("target", nargs="*", metavar="ARG")
    p.set_defaults(fn=cmd_read)

    p = sub.add_parser("status", help="progress dashboard: [track], or every track")
    p.add_argument("target", nargs="*", metavar="TRACK")
    p.set_defaults(fn=cmd_status)

    p = sub.add_parser("next", help="what to work on next: [track], or one line per track")
    p.add_argument("target", nargs="*", metavar="TRACK")
    p.set_defaults(fn=cmd_next)

    p = sub.add_parser("setup", help="one-time toolchain prep for a track")
    p.add_argument("track")
    p.set_defaults(fn=cmd_setup)

    sub.add_parser("doctor", help="diagnose your local setup").set_defaults(fn=cmd_doctor)

    p = sub.add_parser("review", help="list or run due spaced reviews (all tracks)")
    p.add_argument("action", nargs="?", choices=["run"])
    p.set_defaults(fn=cmd_review)

    p = sub.add_parser("plan", help="SQL: EXPLAIN your current solution (no gate)")
    p.add_argument("lesson")
    p.add_argument("exercise", nargs="?")
    p.set_defaults(fn=cmd_plan)

    p = sub.add_parser("lab", help="SQL: persistent psql sandbox clone")
    p.add_argument("lesson", nargs="?")
    p.add_argument("--clean", action="store_true", help="drop all dojo_lab_* databases")
    p.set_defaults(fn=cmd_lab)

    sub.add_parser("reset-baseline", help="SQL: delete data/baseline.json").set_defaults(
        fn=cmd_reset_baseline
    )

    p = sub.add_parser("verify", help="author/CI: [track] [lesson] - prove it is solvable")
    p.add_argument("target", nargs="*", metavar="ARG")
    p.set_defaults(fn=cmd_verify)

    args = parser.parse_args()
    sys.exit(args.fn(args))
