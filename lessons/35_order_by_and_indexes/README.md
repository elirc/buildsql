# 35 — ORDER BY and indexes

A B-tree *is* an ordering — that's what the B stands for (balanced,
but the point stands). So far you've used indexes to find rows; they
can also hand rows back **already sorted**, deleting the Sort node
entirely. For top-N queries this is transformative: "newest 10 of 3
million" stops being "sort 3 million, keep 10" and becomes "read 10
index entries from the right-hand end".

## Concept

```sql
-- serves WHERE customer_id = ? ORDER BY created_at DESC:
CREATE INDEX orders_customer_created_idx ON orders (customer_id, created_at);
```

- An index on `(a, b)` delivers, for fixed `a`, rows ordered by `b` —
  in *either* direction: PostgreSQL walks B-trees backwards for DESC as
  happily as forwards. Explicit `DESC` in the DDL
  (`... (a, b DESC)`) matters only for **mixed** directions
  (`ORDER BY a ASC, b DESC`), which a uniform index can't provide by
  walking one way.
- The pattern to recognize: **equality predicates, then the ORDER BY
  columns, in the index, in that order.** Lesson 32's rule again, with
  "range" generalized to "range or sort".
- `LIMIT` is what makes this huge: an index satisfying the order means
  the executor can *stop after N rows*. Without it, even top-10 needs
  the full sort. Watch for node `Limit` above an Index Scan — that's
  the win-shape.

`dojo plan` both exercises before writing DDL — see the Sort node
you're about to delete.

## Exercise 1 — a customer's most recent orders

`ex1/solution.sql` (provided):

```sql
SELECT id, created_at
FROM orders
WHERE customer_id = 4242
ORDER BY created_at DESC
LIMIT 5;
```

Edit `ex1/indexes.sql`. The gate forbids both Seq Scan **and Sort** —
the index must find *and* order. (The LIMIT matters: without it the
planner may happily grab one customer's handful of rows any old way
and sort them — cheaper than being clever. Give it a top-N and the
ordered index walk wins outright.)

Run: `uv run dojo test 35_order_by_and_indexes ex1`

## Exercise 2 — global top-N

`ex2/solution.sql` (provided):

```sql
SELECT id, ts
FROM events
ORDER BY ts DESC
LIMIT 10;
```

Edit `ex2/indexes.sql`. Ten rows from three million; the baseline
sorts everything. Your index should make this near-instant.

Run: `uv run dojo test 35_order_by_and_indexes ex2`

## The gate

```python
"""Gates for 35_order_by_and_indexes. Quoted verbatim in README.md.

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
    grader.assert_plan(p, must_not_have=['Seq Scan', 'Sort'])
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
    grader.assert_plan(p, must_not_have=['Seq Scan', 'Sort'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)
```

## The teaching point

"Latest N per X" powers every feed, inbox, and activity log in the
industry, and `(x, created_at)` composite indexes power every one that
scales. When someone reports "the first page is fast but sorting is
slow", check EXPLAIN for a Sort node under a Limit — it means the
database sorted everything to give back a page. The fix is never a
faster sort; it's an index that makes sorting unnecessary.

Next: **36_statistics_and_the_planner** — why the planner sometimes
ignores your beautiful index.
