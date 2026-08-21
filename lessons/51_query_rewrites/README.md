# 51 — Query rewrites

> **Part 8 — Optimization patterns (bonus).** Two post-course lessons on the
> optimization work that *isn't* adding indexes. Part 5's gate machinery is
> back — plan shapes and speed ratios — but with a twist: in this lesson,
> **every index you could want already exists**. Each exercise's
> `indexes.sql` ships pre-filled; leave it alone. The query is the problem.

Half of real-world performance work is not "add an index" — it's
"the index is right there and the query can't use it". A predicate
that wraps the column in a function, an `OR` that straddles a join, a
`NOT IN` that quietly forbids the anti-join optimization, a `DISTINCT`
papering over a join that multiplied rows. The index sits unused; the
plan says `Seq Scan`; and no amount of DDL will fix it, because the
DDL was never the problem.

This lesson drills the four rewrites that pay off most often. In each
exercise, `solution.sql` starts as the *slow* query — realistic,
correct, and shaped so PostgreSQL cannot run it well. Your job is to
rewrite it to return **exactly the same rows** in an index-friendly
shape. `dojo plan 51_query_rewrites <ex>` between edits will show you
the moment the plan flips.

## Concept

The planner can only use a B-tree index on `col` when the predicate
compares **the bare column** against something constant-ish for the
scan: `col = x`, `col > x`, `col BETWEEN x AND y`. Anything that
computes on the column first — `date_trunc('day', col)`,
`upper(col)`, `col + 1` — hides the column inside an expression the
tree isn't sorted by. Such predicates are called **non-sargable**
(SARG = "search argument"), and the fix is almost always the same:
move the computation to the *other* side of the comparison.

```sql
-- non-sargable: the index on created_at is invisible
WHERE date_trunc('day', created_at) = TIMESTAMPTZ '2023-06-15 00:00:00+00'

-- sargable: the same rows, as a half-open range on the bare column
WHERE created_at >= TIMESTAMPTZ '2023-06-15 00:00:00+00'
  AND created_at <  TIMESTAMPTZ '2023-06-16 00:00:00+00'
```

The half-open form (`>=` start, `<` next-start) is the idiom worth
memorizing: it tiles perfectly (no gaps or overlaps between days) and
sidesteps the `BETWEEN` trap of including the endpoint.

The other three rewrites in this lesson are structural, not
arithmetic: an `OR` whose arms live in different tables (split it with
`UNION`), a `NOT IN (subquery)` (rewrite as `NOT EXISTS` — an
anti-join), and a join-then-`DISTINCT` (rewrite as `EXISTS` — a
semi-join). Each is a shape the planner refuses to optimize *as
written* but handles beautifully once restated.

## Exercise 1 — unwrap the column

`ex1/solution.sql` (provided — this is the slow query, rewrite it):

```sql
SELECT count(*) AS orders, sum(total) AS revenue
FROM orders
WHERE date_trunc('day', created_at) = TIMESTAMPTZ '2023-06-15 00:00:00+00';
```

A daily-revenue tile on a dashboard. `ex1/indexes.sql` already
provides an index on `orders (created_at)` — and the query above
seq-scans 500,000 rows anyway, calling `date_trunc` on every one of
them, because the index is sorted by `created_at`, not by
`date_trunc('day', created_at)`.

Rewrite the WHERE as a half-open range on the bare column. Same one
row out; the plan should collapse to a bitmap scan over roughly 1,400
of 500,000 rows.

(Lesson 40 solved this shape the *other* way — building an expression
index to match the query. Both are valid; in production you rewrite
the query when you can, because it's a deploy instead of an index
build, and one index on the bare column serves every date range, not
just whole days.)

Run: `uv run dojo test 51_query_rewrites ex1`

## Exercise 2 — NOT IN, the accidental time bomb

The marketing team wants to know how many customers have **never
placed an order**. The query someone shipped:

```sql
SELECT count(*) AS never_ordered
FROM customers
WHERE id NOT IN (SELECT customer_id FROM orders);
```

You met the *correctness* trap of `NOT IN` in lesson 05 (one NULL in
the subquery and it returns nothing — `orders.customer_id` is NOT
NULL, so this one is at least correct). This is the *performance*
trap: PostgreSQL never turns `NOT IN (subquery)` into an anti-join.
While the 500,000 collected ids fit in `work_mem` it hashes them —
tolerable. The day they don't fit, the planner silently switches to
re-scanning the materialized list **per customer row**, and the query
goes from milliseconds to tens of minutes. Same SQL, same answer, a
thousand times slower — it just needed the table to grow.

Don't run the query above against the full dataset unless you enjoy
waiting (this is also why this exercise's gate doesn't time a
baseline). Edit `ex2/solution.sql` (a bare stub) and write the
anti-join form instead: `NOT EXISTS`, or the `LEFT JOIN … IS NULL`
pattern from lesson 09. Either plans as a hash anti-join — the gate
looks for a real join in the plan. Same single count out (5,003 at
full volume).

Run: `uv run dojo test 51_query_rewrites ex2`

## Exercise 3 — OR splits the plan in two

`ex3/solution.sql` (provided — rewrite it):

```sql
SELECT o.id, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.total > 1995
   OR c.email = 'user4242@example.com';
```

A support tool: show the whale orders, plus everything belonging to
the user on the phone. Lesson 38 showed that an `OR` over two indexed
columns of the *same* table is fine — BitmapOr merges the two index
scans. But this `OR` straddles the join: one arm filters `orders`, the
other filters `customers`. No bitmap can merge across two tables, so
the executor's only option is to build the **entire join** — all
500,000 rows — and filter afterward. All three useful indexes
(`orders (total)`, `orders (customer_id)`, `customers (email)`) are
already in `ex3/indexes.sql`, unused.

The rewrite: split the `OR` into two queries — one per arm, each
index-friendly on its own — and glue them with `UNION` (not `UNION
ALL`: a whale order belonging to that very customer would appear in
both arms, and the original query emits it once). Same rows, and the
plan touches ~1,300 rows instead of half a million.

Run: `uv run dojo test 51_query_rewrites ex3`

## Exercise 4 — DISTINCT is not a join strategy

`ex4/solution.sql` (provided — rewrite it):

```sql
SELECT DISTINCT p.id, p.name
FROM products p
JOIN order_items oi ON oi.product_id = p.id
WHERE p.category = 'garden';
```

"Which garden products have ever sold?" The question is about
*existence* — has this product at least one order item? — but the
query answers it by **counting to a million**: join every garden
product to every one of its line items (~160,000 joined rows), then
`DISTINCT` the duplicates back out. The `DISTINCT` isn't logic; it's
cleanup for a join that multiplied rows you never wanted.

Ask about existence directly: `WHERE EXISTS (SELECT 1 FROM order_items
oi WHERE oi.product_id = p.id)`. That's a **semi-join** — for each
product, PostgreSQL probes the (provided) index on
`order_items (product_id)` and *stops at the first hit* instead of
enumerating all of them. No duplicates are ever produced, so there's
nothing to `DISTINCT` away — the gate forbids the dedup nodes
(`HashAggregate`, `Unique`) to make sure the cleanup crew really left.

Run: `uv run dojo test 51_query_rewrites ex4`

## Challenge — the Friday-afternoon query (optional)

`challenge/solution.sql` (provided) commits all three structural sins
at once:

```sql
SELECT DISTINCT c.id, c.name
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE date_trunc('day', o.created_at) = TIMESTAMPTZ '2023-06-15 00:00:00+00'
   OR c.email = 'user4242@example.com';
```

"Everyone who ordered on June 15th — oh, and make sure Dana from the
VIP list is in there." Non-sargable date, `OR` across the join,
`DISTINCT` mopping up. Rewrite it: same rows, at least 5x faster.
`challenge/indexes.sql` provides `orders (created_at)`,
`orders (customer_id)`, and `customers (email)`.

Difficulty note: the honest rewrite has a subtle correctness wrinkle —
the original's `JOIN` means the VIP only appears if they have **at
least one order** (they do — but your rewrite must not *assume* so).
Several shapes work (`UNION` of two semi-joins is the reference's);
plans legitimately differ, so this gate judges by rows and clock only.

Run: `uv run dojo test 51_query_rewrites challenge`

## The gate

```python
"""Gates for 51_query_rewrites. Quoted verbatim in README.md.

Part 5's machinery, inverted: every index you could want already exists
(each exercise's indexes.sql ships pre-filled — leave it alone). The
query is the problem. Rewrite solution.sql until the plan and the clock
agree with you.
"""
import pytest

from dojo import grader, timing
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
    grader.assert_faster_than_baseline(measured, baseline, ratio=5)


def test_ex2(lesson_db):
    # No speed stage here: at full volume the naive NOT IN falls off a
    # cliff (minutes, not milliseconds) — we won't make you sit through
    # the baseline. The plan shape is the whole gate: a real join.
    ex = L.exercise("ex2")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_have=['Hash Join'])


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
    grader.assert_plan(p, must_not_have=['HashAggregate', 'Unique'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=5)


@pytest.mark.challenge
def test_challenge(lesson_db):
    # Speed-only: several rewrites are legitimate here and their plans
    # differ, so the clock is the judge.
    ex = L.exercise("challenge")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_challenge",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=5)
```

For each exercise: the reference (slow) query and your rewrite run
against the same clone and must return the same rows. Then the plan is
checked for the shape the rewrite should produce — no `Seq Scan` once
the index applies (ex1, ex3), a real join instead of a subplan (ex2),
no dedup nodes (ex4) — and finally your query must beat the naive
baseline this machine measured for itself (5x where the physics are
bitmap-bound, 8x where they're not). Exercise 2 skips the clock: its
baseline is the one query in this course too slow to measure politely.

## The teaching point

An index is a contract with a *query shape*, not with a table. The
rewrites in this lesson — computation off the column, `OR` split into
`UNION`, `NOT IN` to `NOT EXISTS`, `DISTINCT`-join to `EXISTS` — are
the four you'll apply most often in code review, and all four share
one property: **the rows don't change, only the shape does.** That's
what makes them safe to apply on a Friday afternoon. When a query is
slow and the index "should" work, diff the query's shape against the
index's contract before you reach for more DDL.

Next: **52_keyset_pagination** — the OFFSET cliff, and the rewrite
that makes page 10,000 as fast as page 1.
