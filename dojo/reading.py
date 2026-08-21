"""Reading material: the theory behind each exercise, plus curated links.

Every lesson ships a `reading.md` next to its `README.md`. The README is the
*instructions*; reading.md is the *why* — the model you need in your head for
the exercise to make sense, written to be read after you attempt the problem,
whether you passed or failed.

File format (parsed here, linted by `dojo verify`):

    # Reading - 06_aggregates
    <optional intro paragraph>

    ## Notes
    <lesson-wide theory>

    ## ex1 - a title for this problem's idea
    <why this problem exists, the mental model, the classic mistake>

    ## Further reading
    - [title](url) - one line on why it is worth your time

Section keys are the text before the first dash in the heading, lowercased:
`notes`, `ex1`, `ex2`, `challenge`, `review1`, `further reading`.
"""
from __future__ import annotations

import os
import re
from dataclasses import dataclass
from pathlib import Path

from dojo.config import ROOT

EXERCISE_KEY = re.compile(r"ex\d+|challenge|review\d+")
_HEADING = re.compile(r"^##[ \t]+(.+?)[ \t]*$", re.M)
_SPLIT_TITLE = re.compile(r"\s+[—–-]\s+")
WORDS_PER_MINUTE = 180


def disabled() -> bool:
    """Suppress the interactive post-gate prompt (CI, `dojo verify`, scripts)."""
    return bool(os.environ.get("DOJO_NO_READING"))


@dataclass(frozen=True)
class Section:
    key: str
    title: str
    body: str

    @property
    def heading(self) -> str:
        return f"{self.key} - {self.title}" if self.title else self.key

    @property
    def minutes(self) -> int:
        return max(1, round(len(self.body.split()) / WORDS_PER_MINUTE))


@dataclass(frozen=True)
class Reading:
    slug: str
    path: Path
    intro: str
    sections: tuple[Section, ...]

    def get(self, key: str) -> Section | None:
        key = key.strip().lower()
        for s in self.sections:
            if s.key == key:
                return s
        return None

    @property
    def notes(self) -> Section | None:
        return self.get("notes")

    @property
    def further_reading(self) -> Section | None:
        return self.get("further reading")

    def exercise_sections(self) -> list[Section]:
        return [s for s in self.sections if EXERCISE_KEY.fullmatch(s.key)]

    def exercise_keys(self) -> list[str]:
        return [s.key for s in self.exercise_sections()]

    @property
    def minutes(self) -> int:
        words = len(self.intro.split()) + sum(len(s.body.split()) for s in self.sections)
        return max(1, round(words / WORDS_PER_MINUTE))

    def links(self) -> list[tuple[str, str]]:
        """(title, url) pairs found anywhere in the document, in order."""
        text = "\n".join([self.intro, *(s.body for s in self.sections)])
        return re.findall(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", text)


def _split_heading(heading: str) -> tuple[str, str]:
    parts = _SPLIT_TITLE.split(heading, maxsplit=1)
    return parts[0].strip().lower(), (parts[1].strip() if len(parts) > 1 else "")


def parse(text: str, slug: str = "", path: Path | None = None) -> Reading:
    matches = list(_HEADING.finditer(text))
    head = text[: matches[0].start()] if matches else text
    intro = re.sub(r"^#[^#].*$", "", head, count=1, flags=re.M).strip()

    sections: list[Section] = []
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        key, title = _split_heading(m.group(1))
        sections.append(Section(key, title, text[m.end():end].strip()))
    return Reading(slug, path or Path(), intro, tuple(sections))


def path_for(slug: str, track=None) -> Path:
    """`track` is a dojo.tracks.Track, or None for the SQL track (the default).

    Duck-typed on purpose: this module stays importable without dojo.tracks.
    """
    if track is None or getattr(track, "is_sql", True):
        return ROOT / "lessons" / slug / "reading.md"
    return track.lesson_dir(slug) / "reading.md"


def command_prefix(track=None) -> str:
    """'' for SQL, 'typescript ' for a track - so printed commands are runnable."""
    if track is None or getattr(track, "is_sql", True):
        return ""
    return f"{track.name} "


def load(slug: str, track=None) -> Reading | None:
    p = path_for(slug, track)
    try:
        text = p.read_text(encoding="utf-8")
    except OSError:
        return None
    return parse(text, slug, p)


def _load(slug: str, track=None) -> Reading | None:
    """Call `load` with the arity it has always had when there is no track.

    Tests (and anything else) that stub `reading.load` with a one-argument
    callable keep working; only track-aware callers pass the second argument.
    """
    return load(slug) if track is None else load(slug, track)


# -- rendering -------------------------------------------------------------

def _console():
    from rich.console import Console

    return Console()


def _panel(body: str, title: str, subtitle: str = ""):
    from rich.markdown import Markdown
    from rich.panel import Panel

    return Panel(
        Markdown(body),
        title=title,
        subtitle=subtitle or None,
        border_style="cyan",
        padding=(1, 2),
    )


def render(slug: str, exercise: str | None = None, console=None, track=None) -> int:
    """Print the reading for a lesson, or for one exercise within it."""
    console = console or _console()
    doc = _load(slug, track)
    prefix = command_prefix(track)
    if doc is None:
        rel = path_for(slug, track)
        try:
            rel = rel.relative_to(ROOT)
        except ValueError:
            pass
        console.print(
            f"[yellow]No reading material for {slug} yet.[/yellow] "
            f"Expected [dim]{rel}[/dim]."
        )
        return 1

    if exercise:
        section = doc.get(exercise)
        if section is None:
            keys = ", ".join(doc.exercise_keys()) or "(none)"
            console.print(
                f"[yellow]{slug}/reading.md has no section for '{exercise}'.[/yellow]\n"
                f"  Sections it does have: {keys}\n"
                f"  Showing the whole lesson's reading instead.\n"
            )
            return render(slug, None, console, track)
        console.print(
            _panel(
                section.body,
                f"[bold]Reading - {slug} / {exercise}[/bold]",
                f"~{section.minutes} min",
            )
        )
        notes = doc.notes
        if notes:
            console.print(
                f"\n[dim]Lesson-wide notes (~{notes.minutes} min): "
                f"uv run dojo read {prefix}{slug}[/dim]"
            )
        further = doc.further_reading
        if further:
            console.print()
            console.print(_panel(further.body, "[bold]Further reading[/bold]"))
        return 0

    if doc.intro:
        console.print(_panel(doc.intro, f"[bold]Reading - {slug}[/bold]", f"~{doc.minutes} min"))
        console.print()
    for section in doc.sections:
        subtitle = f"~{section.minutes} min" if section.key == "notes" else ""
        console.print(_panel(section.body, f"[bold]{section.heading}[/bold]", subtitle))
        console.print()
    return 0


# -- the post-gate "open the reading" button --------------------------------

def _uri(path: Path) -> str:
    try:
        return path.as_uri()
    except ValueError:
        return str(path)


def button(slug: str, exercise: str | None, passed: bool, console=None,
           interactive: bool | None = None, track=None) -> bool:
    """Offer the reading for the exercise that was just graded.

    Shown after every graded run, pass or fail - failing means you are missing
    the model, passing is the cheapest moment to lock it in. Returns True if
    the reading was displayed.
    """
    import sys

    console = console or _console()
    doc = _load(slug, track)
    if doc is None or disabled():
        return False

    section = doc.get(exercise) if exercise else None
    target = exercise if section else None
    label = f"{slug}/{exercise}" if target else slug
    minutes = section.minutes if section else doc.minutes
    n_links = len(doc.links())

    lead = (
        "Green. Lock it in while it is fresh:"
        if passed
        else "Red. The theory this problem is testing:"
    )
    cmd = f"uv run dojo read {command_prefix(track)}{slug}" + (f" {target}" if target else "")
    try:
        rel = doc.path.relative_to(ROOT).as_posix()
    except ValueError:
        rel = str(doc.path)
    link = f"[link={_uri(doc.path)}]{rel}[/link]"

    from rich.panel import Panel

    console.print()
    console.print(
        Panel(
            f"{lead}\n\n"
            f"  [bold cyan on default] [ READ: {label} ] [/bold cyan on default]"
            f"   [dim]~{minutes} min"
            + (f", {n_links} links" if n_links else "")
            + "[/dim]\n\n"
            f"  [dim]press [bold]Enter[/bold] to open it here, "
            f"[bold]s[/bold] to skip[/dim]\n"
            f"  [dim]any time:  [bold]{cmd}[/bold][/dim]\n"
            f"  [dim]file:      {link}[/dim]",
            title="[bold]Reading[/bold]",
            border_style="cyan" if passed else "yellow",
            padding=(1, 2),
        )
    )

    if interactive is None:
        interactive = sys.stdin is not None and sys.stdin.isatty()
    if not interactive:
        return False
    try:
        answer = input("  > ").strip().lower()
    except (EOFError, KeyboardInterrupt):
        console.print()
        return False
    if answer in {"s", "n", "no", "skip", "q"}:
        return False
    console.print()
    render(slug, target, console, track)
    from dojo import progress

    if track is None or getattr(track, "is_sql", True):
        read_id = f"{slug}::test_{exercise}" if target else slug
    else:
        read_id = track.exercise_id(slug, target) if target else f"{track.name}/{slug}"
    progress.record_reading(read_id)
    return True
