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
    ("Part 4 — Drill sets (volume 2)", [
        _l("d01_annotations_inference", 8),
        _l("d02_functions_signatures", 8),
        _l("d03_objects_shapes", 8),
        _l("d04_interfaces_aliases", 8),
        _l("d05_unions_basics", 8),
        _l("d06_narrowing_guards", 8),
        _l("d07_discriminated_unions", 8),
        _l("d08_literals_const_enums", 8),
        _l("d09_generic_functions", 8),
        _l("d10_generic_constraints", 8),
        _l("d11_keyof_indexed_access", 8),
        _l("d12_builtin_utilities", 8),
        _l("d13_implement_utilities", 8),
        _l("d14_mapped_types", 8),
        _l("d15_conditional_types", 8),
        _l("d16_infer_patterns", 8),
        _l("d17_template_literal_types", 8),
        _l("d18_guards_advanced", 8),
        _l("d19_unknown_any_never", 8),
        _l("d20_satisfies_asconst", 8),
        _l("d21_async_typing", 8),
        _l("d22_declaration_files", 8),
        _l("d23_realworld_apis", 8),
        _l("d24_mixed_gauntlet", 8),
    ]),
    ("Part 5 — Interview prep", [
        _l("i1_interview_concepts", 4, review=True),
        _l("i2_interview_drills", 6, challenge=True, review=True),
        _l("i3_interview_rapidfire", 4, review=True),
    ]),
]
