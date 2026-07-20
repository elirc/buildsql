# 32 — Composite indexes

"Customer 4242's *paid* orders." Two predicates. A single-column index
on `customer_id` gets you to eleven rows fast and filters the rest —
decent. But an index on **(customer_id, status)** descends straight to
the exact rows: both predicates resolved inside the tree, zero rows
thrown away. Multi-column (composite) indexes are how real query
patterns get indexed — and their column *order* is the design decision
this lesson drills.

## Concept

```sql
CREATE INDEX orders_customer_status_idx ON orders (customer_id, status);
```

Think of a composite index as sorted by column 1, then column 2 within
equal column-1 values — a phone book sorted by (last name, first name).

The ordering rules that cover ~90% of real design:

1. **Equality columns first, range columns last.** For `WHERE a = ? AND
   b >= ?`, index `(a, b)`: the tree jumps to the `a` group, then reads
   the contiguous `b >= ?` run inside it. Index `(b, a)` instead and
   the range on `b` scatters your `a` matches across the whole scan.
2. **A range breaks the chain**: columns after the *first range column*
   in the index can't narrow the descent (they can still filter inside
   the index — helpful, but not the same thing).
3. The index also serves any **left prefix**: `(customer_id, status)`
   works for `WHERE customer_id = ?` alone. It does nothing for
   `WHERE status = ?` alone — that's next lesson's whole story.

## Exercise 1 — two equalities

`ex1/solution.sql` (provided):

```sql
SELECT id, total
FROM orders
WHERE customer_id = 4242
  AND status = 'paid';
```

Edit `ex1/indexes.sql`: one composite index serving both predicates.

Run: `uv run dojo test 32_composite_indexes ex1`

## Exercise 2 — equality then range

`ex2/solution.sql` (provided):

```sql
SELECT id, ts
FROM events
WHERE customer_id = 777
  AND ts >= '2023-11-01';
```

Edit `ex2/indexes.sql`. Rule 1 dictates the order — get it backwards
and the plan may still avoid a Seq Scan but the speed stage will notice
the wasted work on this 3M-row table.

Run: `uv run dojo test 32_composite_indexes ex2`

## The gate

```python
"""Gates for 32_composite_indexes. Quoted verbatim in README.md.

Part 5's three-stage gate: correct rows -> right plan shape -> fast enough
against this machine's own cached baseline (data/baseline.json).
"""
import pytest

from dojo import db, grader, timing
from dojo.lesson import Lesson
from dojo.plan import explain

L = Lesson(__file__)


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex1",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=['Seq Scan'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


def test_ex2(lesson_db):
    ex = L.exercise("ex2")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex2",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=['Seq Scan'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)
```

## The teaching point

Composite-index design is *query-driven*, not table-driven: you index a
**pattern** (`by customer, filtered by status`) rather than columns in
isolation. The interview-and-review checklist: list the query's
equality predicates, then its range/sort columns — that's your column
order. And before adding a new index, check whether an existing one's
left prefix already covers you; index sprawl is a write-amplification
tax everyone forgets until the ingest pipeline slows.

Next: **33_left_prefix** — the prefix rule, and the unindexed-FK trap.
