"""Best-of-N timing plus the per-machine baseline cache."""
from __future__ import annotations

import json

from dojo.config import ROOT
from dojo.plan import explain

BASELINE_PATH = ROOT / "data" / "baseline.json"


def measure_execution_ms(conn, query: str, repeats: int = 5, warmup: int = 1) -> float:
    """Best-of-N EXPLAIN ANALYZE execution time, after warmup runs.

    Measured with TIMING OFF: per-node clocks add per-row overhead that
    unfairly penalizes plans flowing many rows.
    """
    for _ in range(warmup):
        explain(conn, query, timing=False)
    best = float("inf")
    for _ in range(repeats):
        p = explain(conn, query, timing=False)
        t = p.execution_time_ms
        if t is not None and t < best:
            best = t
    return best


def _read_baselines() -> dict[str, float]:
    try:
        return json.loads(BASELINE_PATH.read_text())
    except (OSError, ValueError):
        return {}


def _write_baselines(data: dict[str, float]) -> None:
    BASELINE_PATH.parent.mkdir(exist_ok=True)
    BASELINE_PATH.write_text(json.dumps(data, indent=2, sort_keys=True))


def cached_baseline(conn, key: str, query: str, repeats: int = 3) -> float:
    """Per-machine baseline for `key`; measured once and cached in data/baseline.json.

    Delete the file (or run `dojo reset-baseline`) to recalibrate.
    """
    baselines = _read_baselines()
    if key in baselines:
        return baselines[key]
    ms = measure_execution_ms(conn, query, repeats=repeats)
    baselines[key] = ms
    _write_baselines(baselines)
    return ms


def reset_baselines() -> bool:
    """Delete the baseline cache. Returns True if a file was removed."""
    if BASELINE_PATH.exists():
        BASELINE_PATH.unlink()
        return True
    return False
