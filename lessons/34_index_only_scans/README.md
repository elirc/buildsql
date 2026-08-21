# 34 — Index-only scans

A normal Index Scan is a two-step dance: find the row in the index,
then fetch the full row from the heap (the table) — because the index
only holds its own columns, and because PostgreSQL must check the heap
to know if the row version is visible to your transaction (MVCC —
lesson 44 tells that story properly). But if the index *contains every
column the query touches*, step two can vanish: an **Index Only Scan**
answers from the index alone. For wide tables and hot queries, that's
the difference between touching megabytes and touching kilobytes.

## Concept

Two ways to get every needed column into the index:

```sql
-- 1. widen the key:
CREATE INDEX orders_customer_total_idx ON orders (customer_id, total);

-- 2. INCLUDE: carry payload columns without making them key columns
CREATE INDEX order_items_product_incl_idx
  ON order_items (product_id) INCLUDE (price);
```

`INCLUDE` columns ride along in the leaves but don't participate in
ordering or uniqueness — the honest way to say "I only need you for
covering, not for searching".

**The visibility map caveat** — this *will* bite you someday, so meet
it now: "answers from the index alone" is only legal for heap pages the
**visibility map** marks all-visible. That map is maintained by VACUUM.
On a freshly-bulk-updated table the map is stale, and your beautiful
Index Only Scan silently degrades into heap fetches (`Heap Fetches: N`
in EXPLAIN ANALYZE — nonzero means degraded). The dojo's gates VACUUM
the table after your `indexes.sql` so the demo is clean; production
gives no such courtesy, which is lesson 44's cliffhanger.

## Exercise 1 — cover by widening the key

`ex1/solution.sql` (provided):

```sql
SELECT customer_id, total
FROM orders
WHERE customer_id BETWEEN 100 AND 200;
```

Edit `ex1/indexes.sql`. The gate demands an actual `Index Only Scan`
node — an ordinary Index Scan fails the shape stage. Which two columns
must the index hold?

Run: `uv run dojo test 34_index_only_scans ex1`

## Exercise 2 — cover with INCLUDE

`ex2/solution.sql` (provided):

```sql
SELECT product_id, price
FROM order_items
WHERE product_id = 777;
```

Edit `ex2/indexes.sql` using the `INCLUDE` form — `price` is payload,
not a search key; say so in the DDL.

Run: `uv run dojo test 34_index_only_scans ex2`

## Exercise 3 — cover a range of reviews

`ex3/solution.sql` (provided):

```sql
SELECT product_id, rating
FROM reviews
WHERE product_id BETWEEN 100 AND 200;
```

Edit `ex3/indexes.sql`. The gate requires an **`Index Only Scan`** in the
plan — not merely an `Index Scan`.

Two columns appear in the query: one is searched, one is output. Put both
in the index and PostgreSQL never has to visit the table at all — it
answers from the index pages alone. The range column leads because it is
the one being searched.

Roughly 20,000 rows match, which would normally be far too many for an
index scan to beat a sequential one — 20,000 random heap visits is worse
than reading the table. Removing the heap visits is what changes the
arithmetic, and it is why covering indexes matter most exactly where
ordinary indexes stop working.

Run: `uv run dojo test 34_index_only_scans ex3`

## Exercise 4 — payload with INCLUDE

`ex4/solution.sql` (provided):

```sql
SELECT order_id, price
FROM order_items
WHERE order_id BETWEEN 1000 AND 1500;
```

Edit `ex4/indexes.sql` and cover it with **`INCLUDE`** rather than by
widening the key:

```sql
CREATE INDEX ... ON order_items (order_id) INCLUDE (price);
```

The gate requires an `Index Only Scan`.

`INCLUDE` columns are stored in the index's leaf pages only — not in the
internal nodes, and not part of the sort order. That makes them cheaper
than key columns (smaller internal nodes, shallower tree) and it means
they can be types a B-tree could not sort at all. The trade is that you
cannot search or order by them.

The rule: a column you **search or sort by** goes in the key; a column you
only **output** goes in `INCLUDE`.

Run: `uv run dojo test 34_index_only_scans ex4`

## The gate

```python
"""Gates for 34_index_only_scans. Quoted verbatim in README.md.

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
    # index-only scans need a fresh visibility map for the new index's table
    with db.connect(lesson_db.info.dbname, autocommit=True) as vconn:
        vconn.execute("VACUUM orders")
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=['Seq Scan'], must_have=['Index Only Scan'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


def test_ex2(lesson_db):
    ex = L.exercise("ex2")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex2",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    # index-only scans need a fresh visibility map for the new index's table
    with db.connect(lesson_db.info.dbname, autocommit=True) as vconn:
        vconn.execute("VACUUM order_items")
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=['Seq Scan'], must_have=['Index Only Scan'])
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
    grader.assert_plan(p, must_have=['Index Only Scan'], must_not_have=['Seq Scan'])
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
    grader.assert_plan(p, must_have=['Index Only Scan'], must_not_have=['Seq Scan'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)
```

Note the extra step: the gate runs `VACUUM` on the table after applying
your indexes (on a separate autocommit connection — VACUUM refuses to
run inside a transaction), so the visibility map is fresh and the
Index Only Scan is reachable.

## The teaching point

Covering indexes are the standard endgame for a system's few *hottest*
queries — the ones on every request path. They're also the easiest
optimization to overdo: every covered column fattens the index and
taxes every write, and the visibility-map dependency means their
performance quietly degrades on update-heavy tables between vacuums.
Reach for them deliberately: hot path, stable column set, read-mostly
table.

Next: **35_order_by_and_indexes** — indexes that deliver rows pre-sorted.
