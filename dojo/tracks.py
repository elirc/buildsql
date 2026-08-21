"""Track registry - the dojo is six courses sharing one harness.

`sql` is the original course and behaves exactly as it always did: its
manifest is `dojo/curriculum.py`, its lessons live in `lessons/`, its gates
are pytest, and its progress IDs stay `08_inner_joins::test_ex2`.

Every other track lives under `tracks/<name>/` with its own checked-in
manifest at `tracks/<name>/curriculum.py`. Those manifests use the same
`LessonSpec` shape as the SQL one, but `tracks/` is deliberately not a Python
package - the manifests are loaded by path so a content agent can drop a new
track in without touching the harness.

Progress IDs for new tracks are track-prefixed (`typescript/04_unions::ex2`)
so `dojo/progress.py`, the hints machinery and the review ladder work across
tracks unchanged.
"""
from __future__ import annotations

import importlib.util
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

from dojo.config import ROOT

TRACKS_DIR = ROOT / "tracks"

VITEST = "vitest"
DOTNET = "dotnet"
SQL = "sql"


@dataclass(frozen=True)
class Track:
    name: str
    aliases: tuple[str, ...]
    root: Path
    runner: str  # "vitest" | "dotnet" | "sql"
    title: str
    #: vitest tracks only - run gates with --typecheck (expectTypeOf gates).
    typecheck: bool = False
    #: dotnet tracks only - where the learner's C# files live, relative to root.
    source_root: str = ""
    #: file the learner edits inside exN/ (vitest tracks).
    stub_name: str = ""

    # -- layout ------------------------------------------------------------

    @property
    def is_sql(self) -> bool:
        return self.runner == SQL

    @property
    def lessons_dir(self) -> Path:
        return self.root / "lessons"

    def lesson_dir(self, slug: str) -> Path:
        return self.lessons_dir / slug

    @property
    def manifest_path(self) -> Path:
        if self.is_sql:
            return ROOT / "dojo" / "curriculum.py"
        return self.root / "curriculum.py"

    # -- manifest ----------------------------------------------------------

    def parts(self) -> list[tuple[str, list]]:
        return list(_manifest(self).PARTS)

    def all_lessons(self) -> list:
        return [spec for _, lessons in self.parts() for spec in lessons]

    def lesson(self, slug: str):
        for spec in self.all_lessons():
            if spec.slug == slug:
                return spec
        return None

    def resolve_slug(self, name: str) -> str | None:
        """Accept '08', '08_inner_joins', or a unique prefix - as SQL always did."""
        for spec in self.all_lessons():
            if spec.slug == name or spec.slug.startswith(name):
                return spec.slug
        return None

    # -- progress IDs ------------------------------------------------------

    def exercise_id(self, slug: str, exercise_dir: str) -> str:
        if self.is_sql:
            return f"{slug}::test_{exercise_dir}"
        return f"{self.name}/{slug}::{exercise_dir}"

    # -- gates -------------------------------------------------------------

    def gate_paths(self, slug: str) -> list[Path]:
        """Every file that grades this lesson, in the order a README should quote them."""
        if self.runner == VITEST:
            ldir = self.lesson_dir(slug)
            names = ["gate.test.ts", "gate.test.tsx", "gate.test-d.ts"]
            return [ldir / n for n in names if (ldir / n).exists()]
        if self.runner == DOTNET:
            path = self.root / "tests" / "Gates" / f"{source_folder(slug)}Tests.cs"
            return [path] if path.exists() else []
        return [self.lesson_dir(slug) / "test_lesson.py"]

    def source_dir(self, slug: str) -> Path:
        """Where the learner's editable code lives for this lesson.

        JS tracks: the lesson dir itself (exN/solution.ts sits next to the gate).
        .NET tracks: one folder per lesson inside src/Lessons or src/Api.
        """
        if self.runner == DOTNET:
            return self.root / self.source_root / source_folder(slug)
        return self.lesson_dir(slug)

    def learner_file(self, slug: str, exercise_dir: str, reference_name: str) -> Path:
        """Where a file found in exN/.reference/ belongs in the working tree."""
        if self.runner == DOTNET:
            return self.source_dir(slug) / reference_name
        return self.lesson_dir(slug) / exercise_dir / reference_name

    def learner_files(self, slug: str, exercise_dir: str) -> list[Path]:
        """The file(s) `dojo next` tells the learner to edit for one exercise.

        `.reference/` is the authority - it mirrors the learner files exactly -
        so this stays right no matter how many files an exercise touches. For a
        lesson nobody has authored yet we fall back to the naming convention.
        """
        refdir = self.lesson_dir(slug) / exercise_dir / ".reference"
        if refdir.is_dir():
            names = sorted(p.name for p in refdir.iterdir() if p.is_file())
            if names:
                return [self.learner_file(slug, exercise_dir, n) for n in names]
        if self.is_sql:
            return [self.lesson_dir(slug) / exercise_dir / "solution.sql"]
        if self.runner == DOTNET:
            method = exercise_dir[:1].upper() + exercise_dir[1:]
            return [self.source_dir(slug) / f"{method}.cs"]
        return [self.lesson_dir(slug) / exercise_dir / (self.stub_name or "solution.ts")]

    def filter_prefix(self, slug: str) -> str:
        """dotnet test --filter FullyQualifiedName~<this>."""
        return source_folder(slug).split("_", 1)[0] + "_"


def source_folder(slug: str) -> str:
    """'00_hello_dojo' -> 'L00_HelloDojo';  'i1_interview_concepts' -> 'I1_InterviewConcepts'.

    The .NET tracks need one namespace/folder per lesson, and the mapping has
    to be derivable from the slug alone so the runner can build a filter and
    verify can find the files to overlay.
    """
    prefix, _, rest = slug.partition("_")
    pascal = "".join(w[:1].upper() + w[1:] for w in rest.split("_") if w)
    head = f"L{prefix}" if prefix.isdigit() else prefix.upper()
    return f"{head}_{pascal}"


# -- the registry ----------------------------------------------------------

REGISTRY: tuple[Track, ...] = (
    Track(
        name="sql",
        aliases=(),
        root=ROOT,
        runner=SQL,
        title="SQL - PostgreSQL, from first SELECT to query plans",
    ),
    Track(
        name="typescript",
        aliases=("ts",),
        root=TRACKS_DIR / "typescript",
        runner=VITEST,
        title="TypeScript - the type system, hands on",
        typecheck=True,
        stub_name="solution.ts",
    ),
    Track(
        name="node",
        aliases=(),
        root=TRACKS_DIR / "node",
        runner=VITEST,
        title="Node.js - the runtime, the event loop, HTTP",
        stub_name="solution.ts",
    ),
    Track(
        name="react",
        aliases=(),
        root=TRACKS_DIR / "react",
        runner=VITEST,
        title="React - components, state, effects, hooks",
        stub_name="solution.tsx",
    ),
    Track(
        name="csharp",
        aliases=("cs",),
        root=TRACKS_DIR / "csharp",
        runner=DOTNET,
        title="C# - the language, from types to async",
        source_root="src/Lessons",
    ),
    Track(
        name="dotnet",
        aliases=("net",),
        root=TRACKS_DIR / "dotnet",
        runner=DOTNET,
        title="ASP.NET Core - minimal APIs, DI, EF Core, auth",
        source_root="src/Api",
    ),
)

DEFAULT = REGISTRY[0]


def get(name: str) -> Track | None:
    """Exact match on a track name or alias. Case-insensitive."""
    key = (name or "").strip().lower()
    for t in REGISTRY:
        if key == t.name or key in t.aliases:
            return t
    return None


def is_track(name: str) -> bool:
    return get(name) is not None


def resolve(argv: list[str]) -> tuple[Track, list[str]]:
    """The one resolution rule, applied by every track-aware command.

    If the first positional argument names a track, it selects that track and
    is consumed; otherwise the SQL track is used and nothing is consumed. That
    keeps `dojo test 08_inner_joins ex2` meaning exactly what it always meant.
    """
    args = [a for a in argv if a is not None]
    if args:
        track = get(args[0])
        if track is not None:
            return track, args[1:]
    return DEFAULT, args


def parse_exercise_id(exercise_id: str) -> tuple[Track, str, str] | None:
    """'typescript/00_hello_dojo::ex1' -> (typescript, '00_hello_dojo', 'ex1').

    SQL IDs ('08_inner_joins::test_ex2') round-trip to ('08_inner_joins', 'ex2').
    """
    left, sep, right = exercise_id.partition("::")
    if not sep:
        return None
    if "/" in left:
        name, _, slug = left.partition("/")
        track = get(name)
        if track is None:
            return None
        return track, slug, right
    return DEFAULT, left, right.removeprefix("test_")


# -- manifest loading ------------------------------------------------------

class _EmptyManifest:
    PARTS: list[tuple[str, list]] = []


_CACHE: dict[str, object] = {}


def _manifest(track: Track):
    """Load `tracks/<name>/curriculum.py` by path (tracks/ is not a package)."""
    cached = _CACHE.get(track.name)
    if cached is not None:
        return cached
    if track.is_sql:
        from dojo import curriculum

        _CACHE[track.name] = curriculum
        return curriculum

    path = track.manifest_path
    if not path.exists():
        _CACHE[track.name] = _EmptyManifest
        return _EmptyManifest

    mod_name = f"dojo._track_manifest_{track.name}"
    spec = importlib.util.spec_from_file_location(mod_name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[mod_name] = module
    spec.loader.exec_module(module)
    if not hasattr(module, "PARTS"):
        raise AttributeError(f"{path} defines no PARTS list")
    _CACHE[track.name] = module
    return module


def clear_cache() -> None:
    """Tests reload manifests after writing them; the CLI never needs this."""
    _CACHE.clear()
