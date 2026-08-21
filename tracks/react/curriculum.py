"""React track manifest - parts -> lesson slugs -> exercise counts.

Loaded by path from `dojo.tracks` (tracks/ is not a Python package), so this
file may only import from `dojo`, never from a sibling track.
"""
from dojo.curriculum import LessonSpec


def _l(slug: str, n_core: int, challenge: bool = False, review: bool = False) -> LessonSpec:
    return LessonSpec(slug, tuple(f"ex{i}" for i in range(1, n_core + 1)), challenge, review)


PARTS: list[tuple[str, list[LessonSpec]]] = [
    ("Part 0 — Orientation", [
        _l("00_hello_dojo", 3),
    ]),
    ("Part 1 — Components and state", [
        _l("01_components_jsx", 4, challenge=True, review=True),
        _l("02_props_composition", 4, challenge=True, review=True),
        _l("03_state_events", 4, challenge=True, review=True),
        _l("04_lists_conditional", 4, challenge=True, review=True),
        _l("05_forms", 4, challenge=True, review=True),
    ]),
    ("Part 2 — Effects and data", [
        _l("06_effects", 4, challenge=True, review=True),
        _l("07_data_fetching", 4, challenge=True, review=True),
        _l("08_refs_dom", 3, challenge=True, review=True),
    ]),
    ("Part 3 — Scaling a component tree", [
        _l("09_context_reducer", 4, challenge=True),
        _l("10_custom_hooks", 4, challenge=True),
        _l("11_performance_patterns", 4, challenge=True),
    ]),
    ("Part 4 — Interview prep", [
        _l("i1_interview_concepts", 4, review=True),
        _l("i2_interview_drills", 6, challenge=True, review=True),
        _l("i3_interview_rapidfire", 4, review=True),
    ]),
]
