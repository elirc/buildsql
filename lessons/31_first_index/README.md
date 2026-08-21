# 31 — Your first index

Lesson 30's plans all said `Seq Scan`: to find customer 4242's eleven-ish
orders, PostgreSQL reads all 500,000 rows and throws away 499,989 of
them. It has no choice — with no index, the heap (the table's raw
storage) has no order, so *every* lookup is a full read. A B-tree index
is the fix: a sorted structure mapping `customer_id` values to row
locations, turning "read everything" into "descend a tree, fetch
eleven".

From this lesson on, you edit **two files** per exercise: `solution.sql`
usually ships with the query already written (the query isn't the
puzzle), and `indexes.sql`, which starts empty — the DDL is yours. And
the gate grows to three stages: right rows → right plan shape → **at
least 8x faster** than the naive baseline this machine measured for
itself on your first run (recalibrate anytime with `dojo
reset-baseline`).

## Concept

```sql
CREATE INDEX orders_customer_id_idx ON orders (customer_id);
```

- Naming convention: `<table>_<cols>_idx`. Postgres doesn't care;
  colleagues do.
- What you bought: lookups on `customer_id` go from O(all rows) to
  O(log n + matches). What you paid: ~11 MB of disk, and **every**
  INSERT/UPDATE/DELETE on `orders` now maintains the tree. Indexes are
  never free; they're a bet that reads outnumber writes.
- What it does *not* buy: anything for other columns. An index on
  `customer_id` is useless for `WHERE total = ...` — exercise 2 makes
  you watch that failure so you never believe "the table is indexed"
  again. Tables aren't indexed; *columns* (really, *predicates*) are.

Use `dojo plan 31_first_index ex1` before and after writing the DDL —
watch the Seq Scan become an Index Scan (or Bitmap Heap Scan — both
count as victory; the gate only forbids the Seq Scan).

## Exercise 1 — index the lookup

`ex1/solution.sql` (provided):

```sql
SELECT id, status, total
FROM orders
WHERE customer_id = 4242;
```

Edit `ex1/indexes.sql`: create the index that serves it.

Run: `uv run dojo test 31_first_index ex1`

## Exercise 2 — watch the index NOT help

`ex2/indexes.sql` is **provided** — it contains exactly your ex1 index.
`ex2/solution.sql` needs the query (copy it in):

```sql
SELECT id, status, total
FROM orders
WHERE total = 123.45;
```

The gate asserts this plan **must contain a Seq Scan** — the
customer_id index is present and powerless, because `total` isn't in
it. No speed stage; the lesson is the shape.

Run: `uv run dojo test 31_first_index ex2`

## Exercise 3 — one product's reviews

`ex3/solution.sql` (provided) pulls one product's reviews out of a
million:

```sql
SELECT id, rating, created_at
FROM reviews
WHERE product_id = 42;
```

Edit `ex3/indexes.sql` with the index that makes it fast. Same move as
exercise 1 on a different table — and this is the shape you will meet more
than any other in real work: a foreign-key column, filtered by equality,
with no index because PostgreSQL does not create one for you.

The gate requires the plan to contain no `Seq Scan` and the query to run at
least 8× faster than the un-indexed baseline it measures on your machine.

Run: `uv run dojo test 31_first_index ex3`

## Exercise 4 — indexing a value, not a key

`ex4/solution.sql` (provided) finds the maximum-value orders:

```sql
SELECT id, customer_id, status
FROM orders
WHERE total > 1999.90;
```

Edit `ex4/indexes.sql`.

Nothing says an index has to be on a key or a foreign key — an index is
just a sorted copy of one or more columns plus a pointer back to the row,
and any column you filter on equality or range is a candidate. What makes
*this* one worth having is selectivity: `total > 1999.90` matches a
handful of rows out of half a million, so the index eliminates almost
everything. An index on `status`, which has four values across 500,000
rows, would eliminate almost nothing — lesson 39 comes back to why.

Run: `uv run dojo test 31_first_index ex4`

## Challenge — same move, bigger table (optional)

`challenge/solution.sql` (provided) hunts one customer's events in the
3-million-row clickstream:

```sql
SELECT id, ts
FROM events
WHERE customer_id = 31337;
```

Edit `challenge/indexes.sql`. Same 8x gate; note how much more an index
matters at 3M rows than 500k.

Run: `uv run dojo test 31_first_index challenge`

## The gate

```python
"""Gates for 31_first_index. Quoted verbatim in README.md.

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
    """The counter-example: ex2's given index CANNOT serve this query."""
    ex = L.exercise("ex2")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    ex.apply_indexes(lesson_db)  # the customer_id index, provided read-only
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_have=["Seq Scan"])  # yes, MUST have


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


@pytest.mark.challenge
def test_challenge(lesson_db):
    ex = L.exercise("challenge")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_challenge",
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

The single most common performance bug in production applications is
this lesson: a query filtering on an unindexed column, invisible at
10,000 rows, a pager alert at 10 million. The reflex you're building:
see a slow query → EXPLAIN it → find the Seq Scan (or the fat node) →
ask *what predicate needed an index*. Not "add indexes everywhere" —
writes pay for every one of them. One predicate, one deliberate index.

Next: **32_composite_indexes** — indexing two columns at once, in the
right order.
