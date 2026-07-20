# 17 — Conditional aggregation and pivots

"One row per category, one **column** per status." The data lives in long
form — (category, status, revenue) triples — but the CFO's spreadsheet
brain wants a grid. Rotating rows into columns is called **pivoting**, and
in SQL it's nothing more than conditional aggregation: one aggregate per
desired column, each scoped to its slice.

## Concept

Two equivalent idioms:

```sql
-- FILTER (modern, readable — you met it in lesson 06)
sum(oi.quantity * oi.price) FILTER (WHERE o.status = 'paid')    AS paid,

-- CASE inside the aggregate (older; you'll see it in every legacy codebase)
sum(CASE WHEN o.status = 'paid'
         THEN oi.quantity * oi.price ELSE 0 END)                AS paid,
```

One subtle difference: with no matching rows, FILTER yields **NULL**, the
CASE...ELSE 0 form yields **0**. Neither is "right" — but your report
should choose deliberately (`coalesce(..., 0)` converts).

The reverse — columns back into rows — is **unpivoting**. The neat
PostgreSQL idiom is a LATERAL join against a little inline table of
(label, value) pairs:

```sql
SELECT w.category, v.status, v.revenue
FROM wide w
CROSS JOIN LATERAL (VALUES ('pending', w.pending),
                           ('paid',    w.paid)) AS v(status, revenue);
```

`LATERAL` lets the VALUES list mention the current row of `w` — each wide
row explodes into one row per pair. (LATERAL is also worth knowing on its
own; it's "a subquery that can see the row to its left".)

## Exercise 1 — the revenue grid

Edit `ex1/solution.sql`. One row per product `category`; columns:
`category`, then line-item revenue (`sum(quantity * price)`) for each
order status: `pending`, `paid`, `shipped`, `cancelled` — four FILTERed
aggregates over an `orders` × `order_items` × `products` join. Any row
order. (6 rows × 5 columns.)

Run: `uv run dojo test 17_conditional_pivots ex1`

## Exercise 2 — signups by year, the CASE way

Edit `ex2/solution.sql`. One row per `country`: `country`, `y2022`
(customers created in 2022), `y2023` (created in 2023). Use the
`count`/`sum`-with-CASE idiom for at least one of them — you need to be
able to *read* it in legacy code, so write it once. Counts, not NULLs:
a country with no 2022 signups must show 0. Any order. (12 rows;
signups span 2021–2023, so the two columns don't sum to the total.)

Run: `uv run dojo test 17_conditional_pivots ex2`

## Challenge — unpivot it back (optional)

Edit `challenge/solution.sql`. Take ex1's wide grid (rebuild it in a CTE)
and unpivot to long form: `category`, `status`, `revenue` — 24 rows (6
categories × 4 statuses), using the LATERAL VALUES idiom. Any order.
Statuses spelled exactly `pending`, `paid`, `shipped`, `cancelled`.

Run: `uv run dojo test 17_conditional_pivots challenge`

## Spaced review

`review1/`: one row, four columns: the **average** order total per status
(`pending`, `paid`, `shipped`, `cancelled`), each rounded to 2 decimals,
via FILTER.

## The gate

```python
"""Gates for 17_conditional_pivots. Quoted verbatim in README.md."""
import pytest

from dojo import grader
from dojo.lesson import Lesson

L = Lesson(__file__)

def test_ex1(shared_lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex2(shared_lesson_db):
    ex = L.exercise("ex2")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


@pytest.mark.challenge
def test_challenge(shared_lesson_db):
    ex = L.exercise("challenge")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


@pytest.mark.review
def test_review1(shared_lesson_db):
    ex = L.exercise("review1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
```

## The teaching point

Resist the urge to pivot in SQL when the column set is *dynamic* — "one
column per month, forever" means a schema change per month or gnarly
generated SQL. The rule of thumb from production reporting stacks: SQL
produces long form (stable schema, easy to test); the presentation layer
(spreadsheet, BI tool, dataframe) does the final rotation. Pivot in SQL
when the columns are a small, closed set — like four order statuses.

Next: **18_dates_times** — the timestamp toolbox.
