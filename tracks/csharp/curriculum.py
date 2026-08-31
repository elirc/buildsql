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
    ("Part 5 — Drill sets (volume 2)", [
        _l("d01_types_conversion", 8),
        _l("d02_strings_formatting", 8),
        _l("d03_control_flow", 8),
        _l("d04_methods_params", 8),
        _l("d05_classes_construction", 8),
        _l("d06_properties_init", 8),
        _l("d07_inheritance", 8),
        _l("d08_polymorphism", 8),
        _l("d09_interfaces_contracts", 8),
        _l("d10_records_structs", 8),
        _l("d11_equality_semantics", 8),
        _l("d12_generics", 8),
        _l("d13_lists_dictionaries", 8),
        _l("d14_sets_queues_stacks", 8),
        _l("d15_iterators_yield", 8),
        _l("d16_delegates_lambdas", 8),
        _l("d17_events", 8),
        _l("d18_linq_filtering", 8),
        _l("d19_linq_grouping", 8),
        _l("d20_linq_joins_flatten", 8),
        _l("d21_deferred_execution", 8),
        _l("d22_exceptions", 8),
        _l("d23_async_tasks", 8),
        _l("d24_mixed_gauntlet", 8),
    ]),
    ("Part 6 — Interview prep", [
        _l("i1_interview_concepts", 4, review=True),
        _l("i2_interview_drills", 6, challenge=True, review=True),
        _l("i3_interview_rapidfire", 4, review=True),
    ]),
]
