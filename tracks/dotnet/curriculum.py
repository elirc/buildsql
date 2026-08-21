"""ASP.NET Core track manifest - parts -> lesson slugs -> exercise counts.

Loaded by path from `dojo.tracks` (tracks/ is not a Python package), so this
file may only import from `dojo`, never from a sibling track.

Every slug maps to a source folder and namespace by the rule in
`dojo.tracks.source_folder`: 05_efcore_basics -> src/Api/L05_EfcoreBasics,
namespace DotnetDojo.Api.L05_EfcoreBasics, gate class L05_EfcoreBasicsTests.
"""
from dojo.curriculum import LessonSpec


def _l(slug: str, n_core: int, challenge: bool = False, review: bool = False) -> LessonSpec:
    return LessonSpec(slug, tuple(f"ex{i}" for i in range(1, n_core + 1)), challenge, review)


PARTS: list[tuple[str, list[LessonSpec]]] = [
    ("Part 0 — Orientation", [
        _l("00_hello_dojo", 3),
    ]),
    ("Part 1 — The pipeline", [
        _l("01_routing_endpoints", 4, challenge=True, review=True),
        _l("02_dependency_injection", 4, challenge=True, review=True),
        _l("03_middleware", 4, challenge=True, review=True),
        _l("04_configuration_options", 3, challenge=True, review=True),
    ]),
    ("Part 2 — Data with EF Core", [
        _l("05_efcore_basics", 4, challenge=True, review=True),
        _l("06_efcore_relationships", 4, challenge=True, review=True),
    ]),
    ("Part 3 — Shipping a real API", [
        _l("07_rest_crud", 4, challenge=True),
        _l("08_errors_logging", 4, challenge=True),
        _l("09_auth_and_testing", 4, challenge=True),
    ]),
    ("Part 4 — Interview prep", [
        _l("i1_interview_concepts", 4, review=True),
        _l("i2_interview_drills", 6, challenge=True, review=True),
        _l("i3_interview_rapidfire", 4, review=True),
    ]),
]
