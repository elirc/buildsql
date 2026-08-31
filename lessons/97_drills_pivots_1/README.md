# 97 - Drills: conditional aggregates and pivots, set 1

Eight problems on lesson 17: turning rows into columns. Every one of them is
the same move - an aggregate that only looks at some of the group's rows,
written either as `count(*) FILTER (WHERE ...)` or as
`count(CASE WHEN ... THEN 1 END)` - repeated once per column you want. If the
reason a pivot needs one aggregate per output column is still fuzzy, reread
17 before starting.

Both spellings are drilled deliberately. `FILTER` is the modern, readable
one; the `CASE` form is what you will meet in every codebase older than
PostgreSQL 9.4 and in every other database, so you need to read it fluently.

## Exercise 1 - the whole catalogue on one line

One row, six columns, no `GROUP BY`: the number of `products` in each
category. Name the columns `books`, `clothing`, `electronics`, `food`,
`garden`, `toys` - alphabetical, and in that order.

Edit `ex1/solution.sql`. Run: `uv run dojo test 97_drills_pivots_1 ex1`

## Exercise 2 - a rating histogram per product

For every product with `id <= 20` that has at least one review, return
`product_id` and five counts named `stars_1`, `stars_2`, `stars_3`,
`stars_4`, `stars_5` - how many of its reviews carry that rating.

**Ordered by `product_id` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 97_drills_pivots_1 ex2`

## Exercise 3 - the monthly status grid

One row per month of `orders`. Return `month` =
`date_trunc('month', created_at)` and four counts named `pending`, `paid`,
`shipped`, `cancelled` - the number of orders created that month with that
status.

**Ordered by `month` ascending.** (13 rows: the data spans 2022-11-14 to
2023-11-14, so the first and last months are partial.)

Edit `ex3/solution.sql`. Run: `uv run dojo test 97_drills_pivots_1 ex3`

## Exercise 4 - money instead of counts

One row per `orders.status`. Return `status`, `revenue_2022` = the sum of
`total` for that status's orders created before 2023-01-01 rounded to 2, and
`revenue_2023` = the same sum for orders created on or after that date,
rounded to 2.

Use a half-open comparison against the date, not `extract(year ...)`, so the
boundary is stated once.

**Ordered by `status` ascending.** (4 rows.)

Edit `ex4/solution.sql`. Run: `uv run dojo test 97_drills_pivots_1 ex4`

## Exercise 5 - a filtered count over an unfiltered one

For each product `category` return `category`, `products` = how many
products it has, `dear` = how many of them are priced 250 or more, and
`pct_dear` = `round(100.0 * dear / products, 1)`.

Write the ratio out of the two aggregates; you cannot reference the output
aliases from the same SELECT list.

**Ordered by `category` ascending.** (6 rows.)

Edit `ex5/solution.sql`. Run: `uv run dojo test 97_drills_pivots_1 ex5`

## Exercise 6 - a clickstream profile

For the customers with `customer_id <= 10` in `events`, one row each: the
counts of their events by type, as `views`, `clicks`, `carts`, `purchases`,
`logouts` (event types `view`, `click`, `add_to_cart`, `purchase`,
`logout`), beside `customer_id`.

**Ordered by `customer_id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 97_drills_pivots_1 ex6`

## Exercise 7 - conversion by country

For each country return `country`, `customers` = the number of customers
there, `paid_buyers` = how many of those customers have at least one `paid`
order, and `pct` = `round(100.0 * paid_buyers / customers, 1)`.

Customers with no orders at all must still count towards `customers` - there
are 5,003 of them - so the join has to be an outer one, and `paid_buyers`
counts *customers*, not orders.

**Ordered by `country` ascending.** (12 rows.)

Edit `ex7/solution.sql`. Run: `uv run dojo test 97_drills_pivots_1 ex7`

## Exercise 8 - a pivot with a memory

One row per month of `orders`. Return `month` =
`date_trunc('month', created_at)`, `paid` and `cancelled` = the counts of
orders with those two statuses that month, `cancel_rate` =
`round(100.0 * cancelled / (paid + cancelled), 2)`, and `prev_rate` = the
previous month's `cancel_rate` (NULL for the first month).

Pivot first, then look sideways - a window function cannot be nested inside
an aggregate, so the months have to exist as rows before `lag()` can see
them.

**Ordered by `month` ascending.** (13 rows.)

Edit `ex8/solution.sql`. Run: `uv run dojo test 97_drills_pivots_1 ex8`

## The gate

```python
"""Gates for 97_drills_pivots_1. Quoted verbatim in README.md."""
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

Every gate runs the reference query and yours against the same clone and
compares rows. All eight are graded with `ordered=True`; ex1 returns a single
row, and the other seven name the ordering in the prompt.

Next: **98_drills_pivots_2**, which pivots joined data, builds ratio grids,
and then turns a wide result back into a long one.
