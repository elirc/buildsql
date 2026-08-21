# 39 — Partial indexes

Of 500,000 orders, 83,003 are `'pending'` — and for an ops dashboard,
those are the *only* rows that matter. A full index on `(total)` or
`(created_at)` spends five-sixths of its bulk (and its write
maintenance) on rows the dashboard never asks about. A **partial
index** carries a WHERE clause: it only contains rows matching the
predicate — smaller, faster to maintain, faster to search.

## Concept

```sql
CREATE INDEX orders_pending_total_idx
  ON orders (total)
  WHERE status = 'pending';
```

- The planner uses a partial index only when it can **prove** the
  query's WHERE implies the index's WHERE. `WHERE status = 'pending'
  AND total > 1990` implies `status = 'pending'` ✓. A query filtering
  `status = 'paid'` — or not filtering status at all — can never touch
  this index. The predicate is a contract; the query must restate it.
- The classic use cases: hot-subset dashboards (`WHERE NOT processed`),
  soft-delete schemas (`WHERE deleted_at IS NULL` — often *unique*
  partial indexes: "one active row per email"), and skewed statuses
  like ours.
- Size check in the lab:
  `SELECT pg_size_pretty(pg_relation_size('orders_pending_total_idx'));`
  versus a full-column index — about a sixth, here.

## Exercise 1 — the hot subset

`ex1/solution.sql` (provided):

```sql
SELECT id, total
FROM orders
WHERE status = 'pending'
  AND total > 1990;
```

Edit `ex1/indexes.sql`: one **partial** index (index `total`, predicate
on status). A plain `(status, total)` composite also kills the Seq Scan
— but it's six times the index for the same answer; practice the
partial form here.

Run: `uv run dojo test 39_partial_indexes ex1`

## Exercise 2 — partial + ordering

`ex2/solution.sql` (provided):

```sql
SELECT id
FROM orders
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 20;
```

The pending-orders queue, newest first — lesson 35's pattern welded to
this lesson's. Edit `ex2/indexes.sql`: a partial index that both
selects and orders (the gate forbids Seq Scan *and* Sort).

Run: `uv run dojo test 39_partial_indexes ex2`

## Exercise 3 — index only the rare status

`ex3/solution.sql` (provided) is the refunds team's daily query:

```sql
SELECT id, customer_id, total
FROM orders
WHERE status = 'cancelled' AND total > 1990;
```

Edit `ex3/indexes.sql` with a **partial** index: on `total`, restricted to
cancelled orders.

```sql
CREATE INDEX ... ON orders (total) WHERE status = 'cancelled';
```

The predicate is not a filter you apply at query time — it decides which
rows are *in the index at all*. Roughly 83,000 of 500,000 orders are
cancelled, so this index is a sixth the size of the full one, a sixth the
write cost, and cached far more readily.

For PostgreSQL to use it, the planner must **prove** your `WHERE` implies
the index's predicate. `status = 'cancelled'` matches literally; `status IN
('cancelled')` also works; `status <> 'paid'` does not, because it does not
imply the predicate. That proof requirement is the one thing to remember
about partial indexes.

Run: `uv run dojo test 39_partial_indexes ex3`

## Exercise 4 — the five-star index

`ex4/solution.sql` (provided) powers the "rave reviews" widget:

```sql
SELECT id, created_at
FROM reviews
WHERE rating = 5 AND product_id = 42;
```

Edit `ex4/indexes.sql` with a partial index on `product_id`, restricted to
`rating = 5`.

Note which column went where, and why it is the opposite of what a
composite index would do. A composite `(rating, product_id)` would store
all million reviews and use `rating` as the first level of the tree.
The partial index stores only the 200,000 five-star rows and spends its
entire structure on `product_id` — the column that actually discriminates.

Partial indexes are the tool for a *permanent* asymmetry in the data:
active rows among archived ones, unprocessed rows in a queue, errors in a
log. When the interesting subset is small and stable, indexing only it is
strictly better than indexing everything.

Run: `uv run dojo test 39_partial_indexes ex4`

## The gate

```python
"""Gates for 39_partial_indexes. Quoted verbatim in README.md.

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
    grader.assert_plan(p, must_not_have=['Seq Scan', 'Sort'])
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

Partial indexes are the "know your workload" index: they encode a
business fact (*we query pending, we archive the rest*) into the
storage layer. The failure mode to warn your team about: someone
rewrites the query — `status IN ('pending', 'flagged')` — and the
index silently stops applying; no error, just a seq scan and a slow
page. Partial index predicates belong in the team's shared vocabulary,
not just in the DDL.

Next: **40_expression_indexes** — indexing computed values.
