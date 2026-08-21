"""progress.json read/write and the spaced-review schedule.

Corrupt or missing file is treated as empty - progress bookkeeping must
never crash a test run.
"""
from __future__ import annotations

import json
import os
from datetime import date, datetime, timedelta, timezone

from dojo.config import ROOT

PROGRESS_PATH = ROOT / "data" / "progress.json"
INTERVALS = [3, 7, 21, 60]  # days


def disabled() -> bool:
    return bool(os.environ.get("DOJO_NO_PROGRESS"))


def load() -> dict:
    try:
        data = json.loads(PROGRESS_PATH.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            raise ValueError
    except (OSError, ValueError):
        data = {}
    data.setdefault("exercises", {})
    data.setdefault("reviews", {})
    return data


def save(data: dict) -> None:
    try:
        PROGRESS_PATH.parent.mkdir(exist_ok=True)
        PROGRESS_PATH.write_text(json.dumps(data, indent=2, sort_keys=True), encoding="utf-8")
    except OSError:
        pass


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def record_outcome(exercise_id: str, passed: bool, is_review: bool, today: date | None = None) -> None:
    """Called by the conftest hook after each lesson test's call phase."""
    if disabled():
        return
    today = today or date.today()
    data = load()
    ex = data["exercises"].setdefault(
        exercise_id, {"attempts": 0, "passed_at": None, "hints_used": 0}
    )
    ex["attempts"] += 1
    if passed and not ex.get("passed_at"):
        ex["passed_at"] = _now_iso()

    if is_review:
        rev = data["reviews"].setdefault(
            exercise_id, {"due": today.isoformat(), "interval_index": 0, "history": []}
        )
        rev["history"].append({"date": today.isoformat(), "passed": passed})
        if passed:
            idx = min(rev.get("interval_index", 0) + 1, len(INTERVALS) - 1)
            rev["interval_index"] = idx
            rev["due"] = (today + timedelta(days=INTERVALS[idx])).isoformat()
        else:
            rev["interval_index"] = 0
            rev["due"] = (today + timedelta(days=INTERVALS[0])).isoformat()
    save(data)


def record_hint(exercise_id: str, tier: int) -> None:
    if disabled():
        return
    data = load()
    ex = data["exercises"].setdefault(
        exercise_id, {"attempts": 0, "passed_at": None, "hints_used": 0}
    )
    ex["hints_used"] = max(ex.get("hints_used", 0), tier)
    save(data)


def record_reading(exercise_id: str) -> None:
    """Count an opened reading. Unlike hints, this is a number to be proud of."""
    if disabled():
        return
    data = load()
    ex = data["exercises"].setdefault(
        exercise_id, {"attempts": 0, "passed_at": None, "hints_used": 0}
    )
    ex["readings_opened"] = ex.get("readings_opened", 0) + 1
    save(data)


def passed(data: dict, exercise_id: str) -> bool:
    return bool(data["exercises"].get(exercise_id, {}).get("passed_at"))


def schedule_review(review_id: str, today: date | None = None) -> None:
    """Schedule a lesson's review variant when its core exercises first all pass."""
    if disabled():
        return
    today = today or date.today()
    data = load()
    if review_id in data["reviews"]:
        return  # already scheduled - never reset an existing ladder
    data["reviews"][review_id] = {
        "due": (today + timedelta(days=INTERVALS[0])).isoformat(),
        "interval_index": 0,
        "history": [],
    }
    save(data)


def reviews_due(data: dict | None = None, today: date | None = None) -> list[str]:
    data = data or load()
    today = today or date.today()
    return sorted(
        rid
        for rid, rev in data["reviews"].items()
        if rev.get("due") and date.fromisoformat(rev["due"]) <= today
    )
