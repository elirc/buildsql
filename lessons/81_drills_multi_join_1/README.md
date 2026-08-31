# 81 - Drills: multi-join reports 1

Eight report queries: a dimension from one table, measures from another,
filters from a third. This set draws on lessons 08 and 12 and asks the
questions a stakeholder actually asks - per status, per category, per month,
per country. The SQL is never exotic; the difficulty is choosing the grain
and getting each measure's definition right.

## Exercise 1

Orders placed in **September 2023** (`>= '2023-09-01'` and `< '2023-10-01'`)
by customers in country `GB`, summarised per status. Columns, in this order:
`status`, `orders` (how many), `revenue` (the sum of `orders.total`).

**Ordered by `status` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 81_drills_multi_join_1 ex1`

## Exercise 2

The ten best-selling products of **October 2023** (`>= '2023-10-01'` and
`< '2023-11-01'`) by units sold. Columns, in this order: `id`, `name`,
`units` (the sum of `order_items.quantity`). Ties on units are broken by the
lower product `id`.

**Ordered by `units` descending, then `id` ascending.** Exactly 10 rows.

Edit `ex2/solution.sql`. Run: `uv run dojo test 81_drills_multi_join_1 ex2`

## Exercise 3

Revenue per month per category, for orders created on or after
`2023-10-01`. Columns, in this order: `month` - use
`date_trunc('month', o.created_at)` - then `category`, then `revenue` (the
sum of `quantity * price` taken from the order line).

**Ordered by `month` ascending, then `category` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 81_drills_multi_join_1 ex3`

## Exercise 4

A per-country summary over the whole dataset. Columns, in this order:
`country`, `buyers` (how many distinct customers of that country have
ordered), `orders` (how many orders they placed, **cancelled ones
included**), `revenue` (the sum of `orders.total` over the **non-cancelled**
orders only, `0` if there are none).

**Ordered by `revenue` descending, then `country` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 81_drills_multi_join_1 ex4`

## Exercise 5

For orders created on or after `2023-11-01`, per status: the average number
of order lines per order and the average number of units per order, each
rounded to 2 decimal places. Orders with no lines count as `0` lines and `0`
units and must be included. Columns, in this order: `status`, `avg_lines`,
`avg_units`.

**Ordered by `status` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 81_drills_multi_join_1 ex5`

## Exercise 6

For orders created on or after `2023-11-01`, per category: revenue (the sum
of `quantity * price` from the order line) and that category's share of the
window's **total** revenue as a percentage rounded to 2 decimal places.
Columns, in this order: `category`, `revenue`, `pct`.

**Ordered by `revenue` descending, then `category` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 81_drills_multi_join_1 ex6`

## Exercise 7

For orders created on or after `2023-11-01`, the single best category per
customer country by revenue (`quantity * price` from the order line) - one
row per country, ties broken by the alphabetically first category. Columns,
in this order: `country`, `category`, `revenue`.

**Ordered by `country` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 81_drills_multi_join_1 ex7`

## Exercise 8

A category scorecard over orders created on or after `2023-10-01`. Columns,
in this order: `category`, `units` (sum of quantities), `revenue` (sum of
`quantity * price`), `orders` (how many **distinct** orders contained the
category), `buyers` (how many **distinct** customers bought it), and
`avg_line_revenue` - the average of `quantity * price` across the lines,
rounded to 2 decimal places. Keep only the categories whose (unrounded)
average line revenue is **above 750**.

**Ordered by `revenue` descending, then `category` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 81_drills_multi_join_1 ex8`

## The gate

```python
"""Gates for 81_drills_multi_join_1. Quoted verbatim in README.md."""
from dojo import grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(shared_lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex2(shared_lesson_db):
    ex = L.exercise("ex2")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex3(shared_lesson_db):
    ex = L.exercise("ex3")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex4(shared_lesson_db):
    ex = L.exercise("ex4")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex5(shared_lesson_db):
    ex = L.exercise("ex5")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex6(shared_lesson_db):
    ex = L.exercise("ex6")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex7(shared_lesson_db):
    ex = L.exercise("ex7")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex8(shared_lesson_db):
    ex = L.exercise("ex8")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)
```

Each gate runs the reference query and yours against the same clone and
compares the rows **in order**. Several of these queries read every order
line in the database, so a few seconds per run is normal - that is the query
working, not hanging.

Next: **`82_drills_multi_join_2`**.
