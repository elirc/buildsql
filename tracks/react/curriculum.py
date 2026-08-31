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
    ("Part 4 — Drill sets (volume 2)", [
        _l("d01_jsx_rendering", 8),
        _l("d02_components_props", 8),
        _l("d03_children_composition", 8),
        _l("d04_state_basics", 8),
        _l("d05_events_updates", 8),
        _l("d06_lists_keys", 8),
        _l("d07_conditional_ui", 8),
        _l("d08_forms_controlled", 8),
        _l("d09_forms_validation", 8),
        _l("d10_effects_basics", 8),
        _l("d11_effects_cleanup", 8),
        _l("d12_fetching_states", 8),
        _l("d13_race_abort", 8),
        _l("d14_refs_dom", 8),
        _l("d15_ref_patterns", 8),
        _l("d16_context", 8),
        _l("d17_reducers", 8),
        _l("d18_context_reducer_apps", 8),
        _l("d19_custom_hooks_1", 8),
        _l("d20_custom_hooks_2", 8),
        _l("d21_memoization", 8),
        _l("d22_render_performance", 8),
        _l("d23_component_patterns", 8),
        _l("d24_mixed_gauntlet", 8),
    ]),
    ("Part 5 — Interview prep", [
        _l("i1_interview_concepts", 4, review=True),
        _l("i2_interview_drills", 6, challenge=True, review=True),
        _l("i3_interview_rapidfire", 4, review=True),
    ]),
]
