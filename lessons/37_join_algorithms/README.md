# 37 — Join algorithms

`JOIN` is what you *ask for*; the executor picks one of three ways to
*do* it, and reading join nodes is how you know which — and whether it
was the right call.

## Concept

- **Nested Loop** — for each outer row, find matches on the inner side.
  Brilliant when the outer side is *small* and the inner side has an
  index (each probe is a cheap tree descent). Catastrophic when the
  outer side is large and the inner side seq-scans: that's rows ×
  rows. In EXPLAIN, watch the inner node's `loops=` — its cost
  multiplies by that.
- **Hash Join** — build a hash table from one side, stream the other
  side through it. The workhorse for joining *big things wholesale*;
  needs no indexes at all, needs memory for the build side.
- **Merge Join** — both sides sorted on the join key, zipped together.
  Chosen when sorted order is available cheaply (often via indexes) on
  both sides.

The planner's choice is driven by lesson 36's estimates: "11 orders for
this customer" → nested loop with index probes; "all 500,000 orders" →
hash join. **Indexes change join plans** not by magic but by making the
nested loop's inner probe cheap enough to win.

## Exercise 1 — earn a Nested Loop

`ex1/solution.sql` (provided):

```sql
SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.customer_id = 4242;
```

Without your help this hash-joins 500,000 orders against 50,000
customers to produce eleven rows. Edit `ex1/indexes.sql` so the plan
becomes: find 4242's orders by index, probe `customers` by its primary
key — a Nested Loop where every node touches almost nothing. The gate
requires the Nested Loop *and* the 8x.

Run: `uv run dojo test 37_join_algorithms ex1`

## Exercise 2 — respect the Hash Join

`ex2/solution.sql` needs the query (copy it in):

```sql
SELECT c.country, sum(o.total)
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY c.country;
```

No `indexes.sql` in this exercise **on purpose**. Every order joins;
every customer participates; there is nothing to skip, so probing rows
one-by-one through any index would be *slower* than hashing 50,000
customers and streaming the orders through. The gate asserts the plan
uses a Hash Join — the right tool, un-"optimized".

Run: `uv run dojo test 37_join_algorithms ex2`

## Exercise 3 — a nested loop worth having

`ex3/solution.sql` (provided) fetches one product's reviews with the
product's name attached:

```sql
SELECT r.id, r.rating, p.name
FROM reviews r
JOIN products p ON p.id = r.product_id
WHERE r.product_id = 42;
```

Edit `ex3/indexes.sql`. The gate requires a **`Nested Loop`** in the plan
and the usual 8×.

A nested loop is right when the driving side is tiny and the inner side has
an index: for each of the ~100 matching reviews, look up one product by
primary key. Its cost is `outer_rows × inner_lookup`, which is excellent at
100 outer rows and catastrophic at 500,000 — the same algorithm, two
completely different verdicts, decided entirely by the row-count estimate
from lesson 36.

Your index only has to make the *driving* side small; `products` already
has a primary-key index for the inner lookup.

Run: `uv run dojo test 37_join_algorithms ex3`

## Exercise 4 — change the row count, change the algorithm

`ex4/solution.sql` (provided) attaches customer names to the very
largest orders:

```sql
SELECT o.id, o.total, c.name
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.total > 1999.50;
```

Edit `ex4/indexes.sql`. The gate requires a **`Nested Loop`**.

Without an index the planner has to read all 500,000 orders, so it builds a
hash table of `customers` and streams them past it — a `Hash Join`, and the
right call. Index `orders.total` and the driving side collapses to roughly a
hundred rows, at which point looking each customer up by primary key is far
cheaper than hashing 50,000 of them.

You did not change the query, the join, or the tables. You changed *how
many rows the planner expects*, and it changed algorithms by itself. That
is the lesson: you do not choose join algorithms, you choose the row counts
that make one obviously best.

Run: `uv run dojo test 37_join_algorithms ex4`

## The gate

```python
"""Gates for 37_join_algorithms. Quoted verbatim in README.md.

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
    grader.assert_plan(p, must_not_have=['Seq Scan'], must_have=['Nested Loop'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


def test_ex2(lesson_db):
    """Reading exercise: whole-table joins want a Hash Join - no index fixes that."""
    ex = L.exercise("ex2")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_have=["Hash Join"])


def test_ex3(lesson_db):
    ex = L.exercise("ex3")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex3",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_have=['Nested Loop'], must_not_have=['Seq Scan'])
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
    grader.assert_plan(p, must_have=['Nested Loop'], must_not_have=[])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)
```

## The teaching point

The classic production fire is the **runaway nested loop**: estimates
said 3 rows, reality delivered 300,000, and the inner side executes
300,000 times — a query that ran in 2ms yesterday takes 20 minutes
today. You now have the full diagnostic chain for it: actual-vs-
estimated rows (lesson 36) on the outer side, `loops=` on the inner.
And its inverse: a hash join over tiny filtered sets, because stale
stats hid the filter. Join problems are almost always *estimate*
problems wearing a join costume.

Next: **38_bitmap_scans** — the middle ground between index and seq.
