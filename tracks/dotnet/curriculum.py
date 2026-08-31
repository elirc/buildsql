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
    ("Part 4 — Drill sets (volume 2)", [
        _l("d01_routing", 8),
        _l("d02_route_groups", 8),
        _l("d03_results_statuscodes", 8),
        _l("d04_di_lifetimes", 8),
        _l("d05_di_patterns", 8),
        _l("d06_middleware_order", 8),
        _l("d07_middleware_custom", 8),
        _l("d08_configuration", 8),
        _l("d09_options_validation", 8),
        _l("d10_efcore_crud", 8),
        _l("d11_efcore_queries", 8),
        _l("d12_efcore_relationships", 8),
        _l("d13_efcore_tracking", 8),
        _l("d14_projections_dtos", 8),
        _l("d15_rest_reads", 8),
        _l("d16_rest_writes", 8),
        _l("d17_validation", 8),
        _l("d18_problemdetails", 8),
        _l("d19_logging", 8),
        _l("d20_auth_jwt", 8),
        _l("d21_authorization_policies", 8),
        _l("d22_integration_testing", 8),
        _l("d23_pagination_filtering", 8),
        _l("d24_mixed_gauntlet", 8),
    ]),
    ("Part 5 — Interview prep", [
        _l("i1_interview_concepts", 4, review=True),
        _l("i2_interview_drills", 6, challenge=True, review=True),
        _l("i3_interview_rapidfire", 4, review=True),
    ]),
]
