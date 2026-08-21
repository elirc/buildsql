"""Track registry: resolution, manifests, ID round-trips, path conventions."""
from __future__ import annotations

import textwrap

import pytest

from dojo import tracks
from dojo.config import ROOT


def test_six_tracks_registered():
    names = [t.name for t in tracks.REGISTRY]
    assert names == ["sql", "typescript", "node", "react", "csharp", "dotnet"]


@pytest.mark.parametrize("name,expected", [
    ("sql", "sql"),
    ("typescript", "typescript"),
    ("ts", "typescript"),
    ("TS", "typescript"),
    ("  react ", "react"),
    ("csharp", "csharp"),
    ("cs", "csharp"),
    ("dotnet", "dotnet"),
    ("net", "dotnet"),
])
def test_aliases_resolve(name, expected):
    assert tracks.get(name).name == expected


@pytest.mark.parametrize("name", ["", "postgres", "08_inner_joins", "ex1", "vue"])
def test_non_tracks_do_not_resolve(name):
    assert tracks.get(name) is None


def test_resolve_consumes_a_leading_track():
    track, rest = tracks.resolve(["typescript", "00_hello_dojo", "ex1"])
    assert track.name == "typescript"
    assert rest == ["00_hello_dojo", "ex1"]


def test_resolve_defaults_to_sql_and_consumes_nothing():
    """The backward-compatibility guarantee: bare SQL usage is untouched."""
    track, rest = tracks.resolve(["08_inner_joins", "ex2"])
    assert track.name == "sql"
    assert rest == ["08_inner_joins", "ex2"]


def test_resolve_of_nothing_is_sql():
    track, rest = tracks.resolve([])
    assert track.name == "sql"
    assert rest == []


# -- progress IDs -----------------------------------------------------------

def test_sql_exercise_ids_are_unchanged():
    sql = tracks.get("sql")
    assert sql.exercise_id("08_inner_joins", "ex2") == "08_inner_joins::test_ex2"
    assert sql.exercise_id("01_select_basics", "review1") == "01_select_basics::test_review1"


def test_track_exercise_ids_are_prefixed():
    ts = tracks.get("typescript")
    assert ts.exercise_id("04_unions_narrowing", "ex2") == "typescript/04_unions_narrowing::ex2"


@pytest.mark.parametrize("exercise_id,name,slug,exdir", [
    ("typescript/i3_interview_rapidfire::review1", "typescript", "i3_interview_rapidfire", "review1"),
    ("csharp/00_hello_dojo::challenge", "csharp", "00_hello_dojo", "challenge"),
    ("08_inner_joins::test_ex2", "sql", "08_inner_joins", "ex2"),
])
def test_exercise_ids_round_trip(exercise_id, name, slug, exdir):
    track, got_slug, got_ex = tracks.parse_exercise_id(exercise_id)
    assert (track.name, got_slug, got_ex) == (name, slug, exdir)
    assert track.exercise_id(got_slug, got_ex) == exercise_id


def test_parse_exercise_id_rejects_garbage():
    assert tracks.parse_exercise_id("no separator here") is None
    assert tracks.parse_exercise_id("vue/01_thing::ex1") is None


# -- manifests --------------------------------------------------------------

@pytest.mark.parametrize("name,n_lessons", [
    ("typescript", 15), ("node", 15), ("react", 15), ("csharp", 17), ("dotnet", 13),
])
def test_every_manifest_loads_with_the_right_lesson_count(name, n_lessons):
    """Loaded by path - tracks/ is deliberately not an importable package."""
    track = tracks.get(name)
    specs = track.all_lessons()
    assert len(specs) == n_lessons
    assert all(3 <= len(spec.core) <= 6 for spec in specs)


@pytest.mark.parametrize("name", ["typescript", "node", "react", "csharp", "dotnet"])
def test_every_track_ends_in_the_interview_part(name):
    track = tracks.get(name)
    slugs = [s.slug for s in track.all_lessons()]
    assert slugs[0] == "00_hello_dojo"
    assert slugs[-3:] == [
        "i1_interview_concepts", "i2_interview_drills", "i3_interview_rapidfire"
    ]
    # Every interview lesson ships a review variant - that is the mechanism
    # that keeps resurfacing the highest-frequency concepts.
    for spec in track.all_lessons()[-3:]:
        assert spec.review, f"{name}/{spec.slug} must have a review variant"


@pytest.mark.parametrize("name", ["typescript", "node", "react", "csharp", "dotnet"])
def test_slugs_are_unique_within_a_track(name):
    slugs = [s.slug for s in tracks.get(name).all_lessons()]
    assert len(slugs) == len(set(slugs))


def test_sql_manifest_is_the_untouched_curriculum_module():
    from dojo import curriculum

    assert tracks.get("sql").parts() == list(curriculum.PARTS)


def test_slug_prefix_matching_works_per_track():
    assert tracks.get("typescript").resolve_slug("00") == "00_hello_dojo"
    assert tracks.get("csharp").resolve_slug("i2") == "i2_interview_drills"
    assert tracks.get("typescript").resolve_slug("nope") is None


def test_a_missing_manifest_yields_an_empty_track_rather_than_crashing(tmp_path):
    """`dojo status` must render even for a track nobody has scaffolded."""
    ghost = tracks.Track("ghost", (), tmp_path, tracks.VITEST, "nothing here")
    tracks.clear_cache()
    try:
        assert ghost.all_lessons() == []
    finally:
        tracks.clear_cache()


def test_a_manifest_is_loaded_from_its_own_path(tmp_path):
    (tmp_path / "curriculum.py").write_text(textwrap.dedent("""
        from dojo.curriculum import LessonSpec

        PARTS = [("Part 0", [LessonSpec("00_made_up", ("ex1",))])]
    """), encoding="utf-8")
    fake = tracks.Track("scratch", (), tmp_path, tracks.VITEST, "scratch")
    tracks.clear_cache()
    try:
        assert [s.slug for s in fake.all_lessons()] == ["00_made_up"]
    finally:
        tracks.clear_cache()


# -- path conventions -------------------------------------------------------

@pytest.mark.parametrize("slug,folder", [
    ("00_hello_dojo", "L00_HelloDojo"),
    ("10_linq_1", "L10_Linq1"),
    ("13_async_await", "L13_AsyncAwait"),
    ("09_delegates_events_lambdas", "L09_DelegatesEventsLambdas"),
    ("i2_interview_drills", "I2_InterviewDrills"),
])
def test_source_folder_derives_from_the_slug(slug, folder):
    assert tracks.source_folder(slug) == folder


def test_dotnet_filter_prefix():
    assert tracks.get("csharp").filter_prefix("10_linq_1") == "L10_"
    assert tracks.get("csharp").filter_prefix("i3_interview_rapidfire") == "I3_"


def test_sql_lessons_still_live_in_the_repo_root():
    sql = tracks.get("sql")
    assert sql.lessons_dir == ROOT / "lessons"
    assert sql.lesson_dir("08_inner_joins") == ROOT / "lessons" / "08_inner_joins"


def test_learner_file_placement_differs_by_runner():
    ts, cs = tracks.get("typescript"), tracks.get("csharp")
    assert ts.learner_file("00_hello_dojo", "ex1", "solution.ts") == (
        ROOT / "tracks" / "typescript" / "lessons" / "00_hello_dojo" / "ex1" / "solution.ts"
    )
    # .NET references land in the compiled project, not next to the prose.
    assert cs.learner_file("00_hello_dojo", "ex1", "Ex1.cs") == (
        ROOT / "tracks" / "csharp" / "src" / "Lessons" / "L00_HelloDojo" / "Ex1.cs"
    )


def test_learner_files_falls_back_to_convention_for_unauthored_lessons():
    """`dojo next` has to name a file even before anyone has written it."""
    cs = tracks.get("csharp")
    assert cs.learner_files("07_generics", "ex2") == [
        ROOT / "tracks" / "csharp" / "src" / "Lessons" / "L07_Generics" / "Ex2.cs"
    ]
    react = tracks.get("react")
    assert react.learner_files("03_state_events", "ex1")[0].name == "solution.tsx"


def test_learner_files_prefers_the_reference_listing():
    """.reference/ mirrors the learner files, so it is the authority."""
    ts = tracks.get("typescript")
    assert ts.learner_files("00_hello_dojo", "ex1") == [
        ROOT / "tracks" / "typescript" / "lessons" / "00_hello_dojo" / "ex1" / "solution.ts"
    ]
