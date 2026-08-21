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
    ("Part 4 — Interview prep", [
        _l("i1_interview_concepts", 4, review=True),
        _l("i2_interview_drills", 6, challenge=True, review=True),
        _l("i3_interview_rapidfire", 4, review=True),
    ]),
]
