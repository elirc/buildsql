# 50 — GROUPING SETS, ROLLUP, and CUBE

Back in lesson 07 a `GROUP BY status` gave you four rows — one per status. But
real reports almost always want the four rows **and** the total underneath
them. In lesson 17 you faked multi-level summaries with `CASE`/`FILTER`
pivots. This lesson is the real tool: `GROUP BY` extensions that compute
several grouping levels — subtotals, grand totals, cross-tabs — in a single
pass over the data.

The mechanism is one query that is grouped *more than one way at once*. Where a
plain `GROUP BY (a, b)` produces exactly the (a, b) combinations, `GROUPING
SETS`, `ROLLUP`, and `CUBE` produce a *union of several groupings* and stack
the results.

## Concept

Three spellings, from most explicit to most convenient:

```sql
-- list the groupings yourself: by category, by status, and the grand total
GROUP BY GROUPING SETS ((category), (status), ())

-- ROLLUP (a, b) = the hierarchy: (a,b), then (a), then ()  — subtotals + total
GROUP BY ROLLUP (category, status)

-- CUBE (a, b) = every combination: (a,b), (a), (b), ()      — the full cross-tab
GROUP BY CUBE (category, status)
```

- `()` is the **grand total** — "group by nothing", one row over everything.
- A rolled-up / subtotal row carries `NULL` in the column it aggregated over.
  That NULL is indistinguishable from a real NULL in the data — so Postgres
  gives you **`GROUPING(col)`**, which returns `1` when the row is a subtotal
  over `col` and `0` when `col` holds a genuine value. Use it to label or
  filter subtotal rows.
- `ROLLUP (a, b)` is a *hierarchy* (it does **not** produce a `(b)`-only
  subtotal); `CUBE (a, b)` is *every* subset. Pick the one whose rows you
  actually want — or spell them out with `GROUPING SETS`.

Paste the concept queries into `uv run dojo lab 50_grouping_sets` and watch the
NULL-bearing subtotal rows appear.

## Exercise 1 — revenue per status, with a grand total

Edit `ex1/solution.sql`. Sum `orders.total` per `status`, and add one more row
for the total across all orders. Columns `status`, `revenue`. **5 rows** (four
statuses + the grand total, whose `status` is NULL), any order.

Run: `uv run dojo test 50_grouping_sets ex1`

## Exercise 2 — category totals and status totals in one query

Edit `ex2/solution.sql`. In a single query, produce revenue broken down three
ways: by product `category`, by order `status`, and overall. Revenue is
`sum(quantity * price)` over `order_items` (join `products` for the category
and `orders` for the status). Columns `category`, `status`, `revenue`. **11
rows** (6 categories + 4 statuses + 1 grand total; the unused dimension is NULL
in each row), any order.

Run: `uv run dojo test 50_grouping_sets ex2`

## Exercise 3 — every combination, with CUBE

Edit `ex3/solution.sql`. Over the same three-table join as exercise 2,
produce **every** breakdown of revenue by category and status at once:
each (category, status) pair, each category's subtotal, each status's
subtotal, and the grand total.

Columns, in this order: `category`, `status`, `revenue` (sum of
`quantity * price`). Any row order.

`CUBE (a, b)` is shorthand for `GROUPING SETS ((a, b), (a), (b), ())` —
every subset of the listed columns. With six categories and four statuses
that is 24 + 6 + 4 + 1 = **35 rows**, and the subtotal rows carry NULL in
the columns they are not grouped by.

`ROLLUP (a, b)` is the other shorthand and means something different: only
the *hierarchical* subsets — `(a, b)`, `(a)`, `()`. Use `ROLLUP` when the
columns nest (year → month → day, country → city); use `CUBE` when they are
independent dimensions you want crossed.

Run: `uv run dojo test 50_grouping_sets ex3`

## Exercise 4 — two independent breakdowns in one pass

Edit `ex4/solution.sql`. Management wants a single result containing
three different views of `orders` revenue: **by month**, **by status**, and
**overall** — but *not* the month × status cross-tab, which would be 52
noisy rows nobody asked for.

Columns, in this order: `month` (`date_trunc('month', created_at)`),
`status`, `revenue` (sum of `total`). Any row order. (13 months + 4
statuses + 1 grand total = **18 rows**.)

This is the case `GROUPING SETS` exists for and neither `ROLLUP` nor `CUBE`
can express: you are listing exactly the aggregations you want, and they
are not a hierarchy or a full cross product.

Write it as `GROUP BY GROUPING SETS ((...), (...), ())`. The empty
parentheses are the grand total — one group containing every row.

Note what you have avoided: three separate queries, three scans of half a
million rows, and three results that could disagree with each other if the
data changed between them.

Run: `uv run dojo test 50_grouping_sets ex4`

## Challenge — a category × status hierarchy, labelled (optional)

Edit `challenge/solution.sql`. Use `ROLLUP (category, status)` over the same
join to produce every (category, status) revenue, a subtotal per category, and
the grand total. Add a fourth column `is_subtotal` = `GROUPING(status)` so a
consumer can tell subtotal rows from detail rows. Columns `category`,
`status`, `revenue`, `is_subtotal`. **31 rows**, any order.

Difficulty note: notice `ROLLUP` gives you per-category subtotals but *no*
per-status subtotal — that asymmetry is the lesson. `GROUPING(status)` is `1`
on the category-subtotal and grand-total rows, `0` on detail rows.

Run: `uv run dojo test 50_grouping_sets challenge`

## The gate

```python
"""Gates for 50_grouping_sets. Quoted verbatim in README.md."""
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


def test_ex3(shared_lesson_db):
    ex = L.exercise("ex3")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex4(shared_lesson_db):
    ex = L.exercise("ex4")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


@pytest.mark.challenge
def test_challenge(shared_lesson_db):
    ex = L.exercise("challenge")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
```

Each gate compares your rows against the reference as a set, so the NULL-
bearing subtotal rows must be present and correct — but their order is free.

## The teaching point

Every "summary with subtotals" a stakeholder has ever asked for — sales by
region with regional and national totals, a P&L with line items rolling up to
categories — is a `ROLLUP` or `GROUPING SETS` away, computed in one scan
instead of one query per level `UNION`-ed together. The database does the
stacking; you just declare which levels you want. And when the NULLs get
confusing, `GROUPING()` is the flashlight.

This is the end of the bonus lessons — and of SQL Dojo. You started at `SELECT
count(*)` and finished at query-plan tuning, safe schema migrations, and
multi-level aggregation. Everything from here is practice and depth. `uv run
dojo status` shows how far you came.
