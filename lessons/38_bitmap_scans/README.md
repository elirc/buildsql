# 38 — Bitmap scans

An Index Scan visits matching rows one by one, jumping around the heap
in index order. Fine for a handful of rows; wasteful when a predicate
matches thousands scattered across the table — the same heap page can
get visited dozens of times. The **bitmap scan** is the middle ground:
scan the index and build a bitmap of "which pages (and rows) match",
then visit each heap page exactly **once**, in physical order.

## Concept

In plans it's a two-node team:

```
Bitmap Heap Scan on orders
  -> Bitmap Index Scan on orders_total_idx
```

(bottom builds the bitmap from the index, top walks the heap with it).
Three things bitmap scans unlock:

1. **Medium selectivity.** Lesson 36's spectrum, filled in: a few rows
   → Index Scan; a big fraction → Seq Scan; the wide middle → Bitmap
   Heap Scan. All three can appear for the *same index* as the
   parameter changes. All of them are the planner working correctly.
2. **Combining indexes with OR / AND.** Bitmaps compose: two separate
   single-column indexes can each produce a bitmap, and `BitmapOr` /
   `BitmapAnd` merge them — the only way an OR across *different
   columns* can use indexes at all.
3. `Rows Removed by Index Recheck` in EXPLAIN ANALYZE: with very large
   bitmaps, Postgres degrades to page-granularity ("lossy") bitmaps
   and rechecks the predicate per row - worth recognizing, not worth
   fearing.

## Exercise 1 — OR across two columns

`ex1/solution.sql` (provided):

```sql
SELECT id
FROM orders
WHERE customer_id = 4242
   OR total > 1999.50;
```

One index can't serve this OR — the two predicates live on different
columns. Edit `ex1/indexes.sql`: **two** single-column indexes. The
gate requires a `BitmapOr` in the plan — watch the two Bitmap Index
Scans feed it.

Run: `uv run dojo test 38_bitmap_scans ex1`

## Exercise 2 — medium selectivity

`ex2/solution.sql` (provided):

```sql
SELECT id
FROM orders
WHERE total BETWEEN 1990 AND 2000;
```

~2,500 matching rows: too many for row-at-a-time index hopping, far
too few for a full scan. Edit `ex2/indexes.sql` (one index) and the
planner will choose the bitmap pair on its own — the gate requires the
`Bitmap Heap Scan`.

Run: `uv run dojo test 38_bitmap_scans ex2`

## The gate

```python
"""Gates for 38_bitmap_scans. Quoted verbatim in README.md.

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
    grader.assert_plan(p, must_not_have=['Seq Scan'], must_have=['BitmapOr'])
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
    grader.assert_plan(p, must_not_have=['Seq Scan'], must_have=['Bitmap Heap Scan'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=3)
```

## The teaching point

Bitmap nodes in a plan are usually *good news* — evidence the planner
found a way to use your indexes proportionately. The actionable
reading: a `BitmapOr` tells you an OR got index treatment (and its
absence under an OR tells you one branch has no index); an enormous
Bitmap Heap Scan with lossy rechecks tells you the predicate matches
so much that you're nearing seq-scan territory — time to question the
query, not add indexes.

Next: **39_partial_indexes** — indexing only the rows you care about.
