"""Node.js track manifest - parts -> lesson slugs -> exercise counts.

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
    ("Part 1 — The runtime", [
        _l("01_modules", 4, challenge=True, review=True),
        _l("02_event_loop", 4, challenge=True, review=True),
        _l("03_async_patterns", 4, challenge=True, review=True),
        _l("04_events_errors", 4, challenge=True, review=True),
    ]),
    ("Part 2 — I/O, buffers and streams", [
        _l("05_fs_path", 4, challenge=True, review=True),
        _l("06_buffers_streams", 4, challenge=True, review=True),
        _l("07_streams_2", 4, challenge=True, review=True),
    ]),
    ("Part 3 — HTTP and services", [
        _l("08_http_core", 4, challenge=True),
        _l("09_express_fundamentals", 4, challenge=True),
        _l("10_middleware_validation", 4, challenge=True),
        _l("11_rest_capstone", 4),
    ]),
    ("Part 4 — Drill sets (volume 2)", [
        _l("d01_esm_cjs", 8),
        _l("d02_module_patterns", 8),
        _l("d03_event_loop_order", 8),
        _l("d04_timers_micro", 8),
        _l("d05_promise_basics", 8),
        _l("d06_async_await", 8),
        _l("d07_concurrency_control", 8),
        _l("d08_promise_combinators", 8),
        _l("d09_emitters", 8),
        _l("d10_error_patterns", 8),
        _l("d11_custom_errors", 8),
        _l("d12_fs_ops", 8),
        _l("d13_path_portability", 8),
        _l("d14_buffers", 8),
        _l("d15_readable_writable", 8),
        _l("d16_transform_pipeline", 8),
        _l("d17_backpressure", 8),
        _l("d18_http_raw", 8),
        _l("d19_http_routing", 8),
        _l("d20_express_routes", 8),
        _l("d21_middleware", 8),
        _l("d22_validation_zod", 8),
        _l("d23_rest_patterns", 8),
        _l("d24_mixed_gauntlet", 8),
    ]),
    ("Part 5 — Interview prep", [
        _l("i1_interview_concepts", 4, review=True),
        _l("i2_interview_drills", 6, challenge=True, review=True),
        _l("i3_interview_rapidfire", 4, review=True),
    ]),
]
