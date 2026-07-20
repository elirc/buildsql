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
