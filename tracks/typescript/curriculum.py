"""TypeScript track manifest - parts -> lesson slugs -> exercise counts.

Loaded by path from `dojo.tracks` (tracks/ is not a Python package), so this
file may only import from `dojo`, never from a sibling track.

Exercise counts here are the contract `dojo status` renders and `dojo verify`
lints; a content author may tune a lesson by +/-1 core exercise, but must
update this file in the same change.
"""
from dojo.curriculum import LessonSpec


def _l(slug: str, n_core: int, challenge: bool = False, review: bool = False) -> LessonSpec:
    return LessonSpec(slug, tuple(f"ex{i}" for i in range(1, n_core + 1)), challenge, review)


PARTS: list[tuple[str, list[LessonSpec]]] = [
    ("Part 0 — Orientation", [
        _l("00_hello_dojo", 3),
    ]),
    ("Part 1 — The type system, hands on", [
        _l("01_primitives_and_inference", 4, challenge=True, review=True),
        _l("02_functions", 4, challenge=True, review=True),
        _l("03_objects_interfaces", 4, challenge=True, review=True),
        _l("04_unions_narrowing", 4, challenge=True, review=True),
        _l("05_literals_enums", 3, challenge=True, review=True),
    ]),
    ("Part 2 — Generics and type-level programming", [
        _l("06_generics_1", 4, challenge=True, review=True),
        _l("07_generics_2", 4, challenge=True, review=True),
        _l("08_utility_types", 4, challenge=True, review=True),
        _l("09_mapped_conditional", 4, challenge=True),
    ]),
    ("Part 3 — Safety and the real world", [
        _l("10_guards_assertions", 4, challenge=True),
        _l("11_async_and_modules", 4, challenge=True),
    ]),
    ("Part 4 — Interview prep", [
        _l("i1_interview_concepts", 4, review=True),
        _l("i2_interview_drills", 6, challenge=True, review=True),
        _l("i3_interview_rapidfire", 4, review=True),
    ]),
]
