"""Assertions with teaching-oriented failure messages.

Every failure should tell the learner (a) which check failed, (b) what the
evidence is, and (c) what to reconsider - never a bare AssertionError.
"""
from __future__ import annotations

import json
from collections import Counter
from typing import Any, Sequence

import pytest

from dojo.plan import Plan


# -- row comparison ------------------------------------------------------

def _norm_cell(v: Any) -> Any:
    """Make cells hashable/comparable (jsonb comes back as dict/list)."""
    if isinstance(v, (dict, list)):
        return json.dumps(v, sort_keys=True, default=str)
    if isinstance(v, float):
        return round(v, 9)
    return v


def _norm_row(row: Sequence[Any]) -> tuple:
    return tuple(_norm_cell(v) for v in row)


def _show(rows: Sequence[Sequence[Any]], limit: int = 5) -> str:
    if not rows:
        return "    (no rows)"
    shown = [f"    {tuple(r)!r}" for r in rows[:limit]]
    if len(rows) > limit:
        shown.append(f"    ... and {len(rows) - limit:,} more")
    return "\n".join(shown)


def assert_rows_equal(actual, expected, ordered: bool = False) -> None:
    actual = list(actual)
    expected = list(expected)

    # Column-count mismatch is the most common beginner error - call it out.
    if actual and expected and len(actual[0]) != len(expected[0]):
        raise AssertionError(
            f"COLUMN MISMATCH: your query returns {len(actual[0])} columns, "
            f"expected {len(expected[0])} - check your SELECT list.\n"
            f"  Expected first row: {tuple(expected[0])!r}\n"
            f"  Your first row:     {tuple(actual[0])!r}"
        )

    norm_actual = [_norm_row(r) for r in actual]
    norm_expected = [_norm_row(r) for r in expected]

    if norm_actual == norm_expected:
        return

    if Counter(norm_actual) == Counter(norm_expected):
        if ordered:
            first_diff = next(
                (i for i, (a, e) in enumerate(zip(norm_actual, norm_expected)) if a != e),
                0,
            )
            raise AssertionError(
                "RIGHT ROWS, WRONG ORDER - your query returns exactly the right rows, "
                "but not in the required order. Check your ORDER BY.\n"
                f"  First out-of-place row (position {first_diff + 1}):\n"
                f"    expected {tuple(expected[first_diff])!r}\n"
                f"    yours    {tuple(actual[first_diff])!r}"
            )
        return  # unordered comparison: multiset equality is enough

    msg = [
        "ROW MISMATCH: your query's results don't match the expected results.",
        f"  Expected {len(expected):,} rows; your query returned {len(actual):,} rows.",
    ]
    if len(norm_actual) == len(norm_expected):
        cmp_a = norm_actual if ordered else sorted(norm_actual)
        cmp_e = norm_expected if ordered else sorted(norm_expected)
        for i, (a, e) in enumerate(zip(cmp_a, cmp_e)):
            if a != e:
                msg.append(f"  Row counts match, but content differs. First differing pair:")
                msg.append(f"    expected {e!r}")
                msg.append(f"    yours    {a!r}")
                break
    else:
        missing = Counter(norm_expected) - Counter(norm_actual)
        extra = Counter(norm_actual) - Counter(norm_expected)
        if missing:
            some = list(missing.elements())[:3]
            msg.append(f"  Rows you are MISSING (up to 3): {some!r}")
        if extra:
            some = list(extra.elements())[:3]
            msg.append(f"  EXTRA rows you returned (up to 3): {some!r}")
    msg.append("  Expected (first 5):")
    msg.append(_show(expected))
    msg.append("  Yours (first 5):")
    msg.append(_show(actual))
    raise AssertionError("\n".join(msg))


# -- plan shape ------------------------------------------------------------

GUIDANCE = {
    "Seq Scan": (
        "Postgres is still reading the whole table - is your index on the "
        "column the WHERE clause actually filters on?"
    ),
    "Sort": (
        "Postgres is still sorting rows after fetching them - an index that "
        "matches the ORDER BY would hand rows back already ordered."
    ),
}


def assert_plan(
    plan: Plan,
    must_have: Sequence[str] | None = None,
    must_not_have: Sequence[str] | None = None,
    uses_index: str | None = None,
) -> None:
    types = plan.node_types()
    problems: list[str] = []
    for t in must_have or []:
        if t not in types:
            problems.append(
                f"PLAN SHAPE: expected a '{t}' node in the plan, but there is none."
            )
    for t in must_not_have or []:
        if t in types:
            hint = GUIDANCE.get(t, "")
            problems.append(
                f"PLAN SHAPE: the plan still contains a '{t}' node. "
                + (hint if hint else "")
            )
    if uses_index and not plan.uses_index(uses_index):
        got = plan.index_names() or ["(no index at all)"]
        problems.append(
            f"PLAN SHAPE: expected the plan to use index '{uses_index}', "
            f"but it uses: {', '.join(got)}."
        )
    if problems:
        raise AssertionError(
            "\n".join(problems)
            + "\n\nYour query's actual plan:\n"
            + plan.render()
        )


# -- speed -----------------------------------------------------------------

def assert_faster_than_baseline(
    measured_ms: float, baseline_ms: float, ratio: float, floor_ms: float = 2.0
) -> None:
    if baseline_ms < floor_ms:
        pytest.skip(
            f"baseline is only {baseline_ms:.2f}ms (< {floor_ms}ms floor) - "
            "too fast to grade speed reliably on this machine/scale"
        )
    target = baseline_ms / ratio
    if measured_ms > target:
        achieved = baseline_ms / measured_ms if measured_ms > 0 else float("inf")
        raise AssertionError(
            f"TOO SLOW: the naive query takes {baseline_ms:.1f}ms on this machine; "
            f"yours takes {measured_ms:.1f}ms.\n"
            f"  Required: at least {ratio:.0f}x faster (<= {target:.2f}ms). "
            f"You achieved {achieved:.1f}x.\n"
            "  Check the plan (`dojo plan <lesson> <ex>`) - is your index actually being used?"
        )


# -- scalar state checks -----------------------------------------------------

def assert_scalar(conn, check_sql: str, expected: Any, label: str) -> None:
    row = conn.execute(check_sql).fetchone()
    actual = row[0] if row else None
    if _norm_cell(actual) != _norm_cell(expected):
        raise AssertionError(
            f"STATE CHECK FAILED: {label}\n"
            f"  Check query: {check_sql.strip()}\n"
            f"  Expected: {expected!r}\n"
            f"  Actual:   {actual!r}"
        )
