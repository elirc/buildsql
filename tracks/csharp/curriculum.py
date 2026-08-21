"""C# track manifest - parts -> lesson slugs -> exercise counts.

Loaded by path from `dojo.tracks` (tracks/ is not a Python package), so this
file may only import from `dojo`, never from a sibling track.

Every slug maps to a source folder and namespace by the rule in
`dojo.tracks.source_folder`: 10_linq_1 -> src/Lessons/L10_Linq1,
namespace CSharpDojo.L10_Linq1, gate class L10_Linq1Tests.
"""
from dojo.curriculum import LessonSpec


def _l(slug: str, n_core: int, challenge: bool = False, review: bool = False) -> LessonSpec:
    return LessonSpec(slug, tuple(f"ex{i}" for i in range(1, n_core + 1)), challenge, review)


PARTS: list[tuple[str, list[LessonSpec]]] = [
    ("Part 0 — Orientation", [
        _l("00_hello_dojo", 3),
    ]),
    ("Part 1 — The language", [
        _l("01_types_variables", 4, challenge=True, review=True),
        _l("02_control_flow_methods", 4, challenge=True, review=True),
        _l("03_classes_objects", 4, challenge=True, review=True),
        _l("04_inheritance_polymorphism", 4, challenge=True, review=True),
        _l("05_interfaces", 4, challenge=True, review=True),
        _l("06_structs_records", 4, challenge=True, review=True),
    ]),
    ("Part 2 — Generics, collections, functions", [
        _l("07_generics", 4, challenge=True, review=True),
        _l("08_collections", 4, challenge=True, review=True),
        _l("09_delegates_events_lambdas", 4, challenge=True, review=True),
    ]),
    ("Part 3 — LINQ", [
        _l("10_linq_1", 4, challenge=True, review=True),
        _l("11_linq_2", 4, challenge=True, review=True),
    ]),
    ("Part 4 — Failure and concurrency", [
        _l("12_exceptions", 4, challenge=True),
        _l("13_async_await", 4, challenge=True),
    ]),
    ("Part 5 — Interview prep", [
        _l("i1_interview_concepts", 4, review=True),
        _l("i2_interview_drills", 6, challenge=True, review=True),
        _l("i3_interview_rapidfire", 4, review=True),
    ]),
]
