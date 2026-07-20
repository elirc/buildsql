"""The `dojo` CLI - primary interface to the course."""
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
from rich.tree import Tree

from dojo import curriculum, progress
from dojo.config import ROOT

console = Console()


def _resolve_slug(name: str) -> str | None:
    """Accept '08', '08_inner_joins', or 'inner_joins'-ish prefixes."""
    for spec in curriculum.all_lessons():
        if spec.slug == name or spec.slug.startswith(name):
            return spec.slug
    return None


def _compose(*args: str) -> int:
    return subprocess.call(["docker", "compose", *args], cwd=ROOT)


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
    slug = _resolve_slug(args.lesson)
    if not slug:
        console.print(f"[red]No lesson matching '{args.lesson}'.[/red] Try `dojo status`.")
        return 1
    pytest_args = [f"lessons/{slug}/test_lesson.py"]
    if args.exercise:
        pytest_args[0] += f"::test_{args.exercise}"
    else:
        pytest_args += ["-m", "not review"]
    pytest_args += ["-q", "--no-header", "-p", "no:cacheprovider"]
    import pytest

    os.chdir(ROOT)
    return pytest.main(pytest_args)


def cmd_hint(args):
    slug = _resolve_slug(args.lesson)
    if not slug:
        console.print(f"[red]No lesson matching '{args.lesson}'.[/red]")
        return 1
    spec = curriculum.lesson(slug)
    hints_path = ROOT / "lessons" / slug / args.exercise / "hints.md"
    if not hints_path.exists():
        console.print(f"[red]No hints for {slug}/{args.exercise}.[/red]")
        return 1
    text = hints_path.read_text(encoding="utf-8")
    tiers = re.split(r"^## Hint \d+\s*$", text, flags=re.M)[1:]
    tiers = [t.strip() for t in tiers]
    if not tiers:
        console.print("[red]hints.md has no '## Hint N' sections.[/red]")
        return 1

    ex_id = spec.exercise_id(args.exercise)
    data = progress.load()
    used = data["exercises"].get(ex_id, {}).get("hints_used", 0)

    if used >= len(tiers):
        console.print(f"[bold]All {len(tiers)} hints for {slug}/{args.exercise}:[/bold]\n")
        for i, t in enumerate(tiers, 1):
            console.print(f"[bold cyan]Hint {i}[/bold cyan]")
            console.print(Markdown(t))
            console.print()
        return 0

    tier = used + 1
    console.print(f"[bold cyan]Hint {tier} of {len(tiers)}[/bold cyan] "
                  f"({slug}/{args.exercise})\n")
    console.print(Markdown(tiers[tier - 1]))
    progress.record_hint(ex_id, tier)
    if tier < len(tiers):
        console.print(f"\n[dim]{len(tiers) - tier} more hint(s) available - "
                      f"run the same command again if you need them.[/dim]")
    return 0


def cmd_status(_):
    data = progress.load()
    today = date.today()
    total_core = passed_core = 0
    due = progress.reviews_due(data, today)

    tree = Tree("[bold]SQL Dojo[/bold]")
    for part_name, lessons in curriculum.PARTS:
        part_node = tree.add(f"[bold]{part_name}[/bold]")
        for spec in lessons:
            icons = []
            lesson_hints = 0
            for exdir in spec.core:
                ex_id = spec.exercise_id(exdir)
                st = data["exercises"].get(ex_id, {})
                lesson_hints += st.get("hints_used", 0)
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
                st = data["exercises"].get(spec.exercise_id("challenge"), {})
                lesson_hints += st.get("hints_used", 0)
                mark = "[green]v[/green]" if st.get("passed_at") else (
                    "[yellow]~[/yellow]" if st.get("attempts") else "[dim]o[/dim]")
                extra.append(f"{mark} challenge")
            if spec.review:
                rid = spec.exercise_id("review1")
                rev = data["reviews"].get(rid)
                if rev:
                    tag = "[red]due[/red]" if rid in due else f"due {rev['due']}"
                    extra.append(f"review ({tag})")
                else:
                    extra.append("[dim]review (unscheduled)[/dim]")
            hint_note = f"  [dim]{lesson_hints} hint(s) used[/dim]" if lesson_hints else ""
            part_node.add(f"{spec.slug}  " + "  ".join(icons + extra) + hint_note)

    pct = (100 * passed_core // total_core) if total_core else 0
    console.print(
        f"[bold]Core progress: {passed_core}/{total_core} exercises ({pct}%)"
        f"  |  reviews due today: {len(due)}[/bold]\n"
    )
    console.print(tree)
    return 0


def cmd_next(_):
    data = progress.load()
    due = progress.reviews_due(data)
    for spec in curriculum.all_lessons():
        for exdir in spec.core:
            if not progress.passed(data, spec.exercise_id(exdir)):
                console.print(
                    f"Next up: [bold]{spec.slug}[/bold] exercise [bold]{exdir}[/bold]\n"
                    f"  read:  lessons/{spec.slug}/README.md\n"
                    f"  edit:  lessons/{spec.slug}/{exdir}/solution.sql\n"
                    f"  run:   uv run dojo test {spec.slug} {exdir}"
                )
                if due:
                    console.print(f"\nAlso: [yellow]{len(due)} review(s) due[/yellow] - `dojo review`")
                return 0
    console.print("[green]All core exercises passed. You have finished the course![/green]")
    if due:
        console.print(f"[yellow]{len(due)} review(s) due[/yellow] - `dojo review`")
    return 0


def cmd_review(args):
    data = progress.load()
    due = progress.reviews_due(data)
    if not due:
        console.print("No reviews due today.")
        return 0
    if args.action != "run":
        console.print(f"[bold]{len(due)} review(s) due:[/bold]")
        for rid in due:
            slug, test = rid.split("::")
            console.print(f"  {slug}  ({test})  - due {data['reviews'][rid]['due']}")
        console.print("\nRun them: uv run dojo review run")
        return 0
    node_ids = []
    for rid in due:
        slug, test = rid.split("::")
        node_ids.append(f"lessons/{slug}/test_lesson.py::{test}")
    import pytest

    os.chdir(ROOT)
    return pytest.main(node_ids + ["-m", "review", "-q", "--no-header", "-p", "no:cacheprovider"])


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


def cmd_verify(args):
    from dojo import verify

    slug = _resolve_slug(args.lesson) if args.lesson else None
    if args.lesson and not slug:
        console.print(f"[red]No lesson matching '{args.lesson}'.[/red]")
        return 1
    return verify.main(slug)


def main() -> None:
    parser = argparse.ArgumentParser(prog="dojo", description="SQL Dojo course harness")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("up", help="start the PostgreSQL container").set_defaults(fn=cmd_up)
    sub.add_parser("down", help="stop the PostgreSQL container").set_defaults(fn=cmd_down)
    sub.add_parser("seed", help="build the template database").set_defaults(fn=cmd_seed)

    p = sub.add_parser("test", help="run a lesson's gate")
    p.add_argument("lesson")
    p.add_argument("exercise", nargs="?")
    p.set_defaults(fn=cmd_test)

    p = sub.add_parser("hint", help="reveal the next hint tier")
    p.add_argument("lesson")
    p.add_argument("exercise")
    p.set_defaults(fn=cmd_hint)

    sub.add_parser("status", help="progress dashboard").set_defaults(fn=cmd_status)
    sub.add_parser("next", help="what to work on next").set_defaults(fn=cmd_next)

    p = sub.add_parser("review", help="list or run due spaced reviews")
    p.add_argument("action", nargs="?", choices=["run"])
    p.set_defaults(fn=cmd_review)

    p = sub.add_parser("plan", help="EXPLAIN your current solution (no gate)")
    p.add_argument("lesson")
    p.add_argument("exercise", nargs="?")
    p.set_defaults(fn=cmd_plan)

    p = sub.add_parser("lab", help="persistent psql sandbox clone")
    p.add_argument("lesson", nargs="?")
    p.add_argument("--clean", action="store_true", help="drop all dojo_lab_* databases")
    p.set_defaults(fn=cmd_lab)

    sub.add_parser("reset-baseline", help="delete data/baseline.json").set_defaults(
        fn=cmd_reset_baseline
    )

    p = sub.add_parser("verify", help="author/CI: prove every exercise is solvable")
    p.add_argument("lesson", nargs="?")
    p.set_defaults(fn=cmd_verify)

    args = parser.parse_args()
    sys.exit(args.fn(args))
