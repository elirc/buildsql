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

## Exercise 3 — two equalities on the line items

`ex3/solution.sql` (provided):

```sql
SELECT id, order_id, price
FROM order_items
WHERE product_id = 42 AND quantity = 3;
```

Edit `ex3/indexes.sql` with **one** composite index serving both
conditions.

Two equality conditions, so either column order works for *this* query —
`(product_id, quantity)` and `(quantity, product_id)` both find the rows.
They are not equally good, though: `quantity` has five distinct values
across a million rows, so leading with it means the tree narrows to
200,000 entries before the second column does any work. Lead with the
selective column.

Run: `uv run dojo test 32_composite_indexes ex3`

## Exercise 4 — equality first, range second

`ex4/solution.sql` (provided):

```sql
SELECT id, rating, created_at
FROM reviews
WHERE product_id = 42 AND rating >= 4;
```

Edit `ex4/indexes.sql` with one composite index.

Here the column order is **not** a matter of taste. A B-tree is sorted by
the first column, then the second within equal firsts, and so on — so once
you use a column for a *range*, everything after it is no longer in a
usable order. Equality columns first, range column last. Put `rating`
first and the index can only narrow to "rating 4 or 5", then scan 400,000
entries looking for the product.

This one rule explains most composite-index design in practice.

Run: `uv run dojo test 32_composite_indexes ex4`

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


def test_ex3(lesson_db):
    ex = L.exercise("ex3")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex3",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=['Seq Scan'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


def test_ex4(lesson_db):
    ex = L.exercise("ex4")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex4",
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
