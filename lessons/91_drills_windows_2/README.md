# 91 - Drills: window functions 2 - PARTITION BY against GROUP BY

Eight problems on the difference lesson 15 spends most of its time on:
`GROUP BY` replaces many rows with one, `PARTITION BY` leaves every row in
place and adds a column. Several of these ask for the same numbers both ways
so the contrast is not theoretical.

## Exercise 1 - a window sees only what survived WHERE

Products priced above 480, each shown with facts about the other expensive
products in the same category. Columns, in this order: `id`, `name`,
`category`, `price`, `in_category` = how many products above 480 that category
has, `vs_avg` = `round(price - avg(price) OVER (...), 2)` where the average is
over that same filtered set.

`WHERE` runs before the window, so both figures cover only the rows above 480.

**Ordered by `category` ascending, then `id` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 91_drills_windows_2 ex1`

## Exercise 2 - detail rows that carry their total

Every order of customers 1 to 15, with that customer's overall figures beside
it - and one row per order, not per customer. Columns, in this order: `id`,
`customer_id`, `total`, `customer_orders` = that customer's order count,
`customer_total` = `round(sum(total) OVER (...), 2)`.

**Ordered by `customer_id` ascending, then `id` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 91_drills_windows_2 ex2`

## Exercise 3 - an aggregate of the aggregates

Monthly order volume with each month's share of the year. Columns, in this
order: `month` = `date_trunc('month', created_at)`, `orders`, `revenue` =
`sum(total)` rounded to 2, `pct_of_year` =
`round(100 * sum(total) / sum(sum(total)) OVER (), 2)`.

The doubled `sum` is not a typo: the inner one is the group's revenue, the
outer window one adds up the thirteen grouped rows.

**Ordered by `month` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 91_drills_windows_2 ex3`

## Exercise 4 - a partition over grouped rows

Order counts per country and status, with each status's share of its own
country. Columns, in this order: `country`, `status`, `orders`,
`pct_of_country` =
`round(100.0 * count(*) / sum(count(*)) OVER (PARTITION BY country), 2)`.

The four shares inside a country add up to 100.

**Ordered by `country` ascending, then `status` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 91_drills_windows_2 ex4`

## Exercise 5 - a partition on two keys, one of them computed

Every order of customers 1 to 10, each carrying the customer's total for the
calendar month that order falls in. Columns, in this order: `id`,
`customer_id`, `created_at`, `total`, `month_total` = `round(sum(total) OVER
(PARTITION BY customer_id, date_trunc('month', created_at)), 2)`.

**Ordered by `customer_id` ascending, then `created_at` ascending, then `id`
ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 91_drills_windows_2 ex5`

## Exercise 6 - group by two things, partition by one of them

Products by category and colour (`attributes->>'color'`), with the category's
total alongside. Columns, in this order: `category`, `color`, `products`,
`avg_price` = the average price of that category-and-colour combination
rounded to 2, `category_products` = `sum(count(*)) OVER (PARTITION BY
category)`.

**Ordered by `category` ascending, then `color` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 91_drills_windows_2 ex6`

## Exercise 7 - GROUP BY, spelled with a window

Produce the six-row category summary - `category`, `products`, `avg_price`
rounded to 2 - **without a `GROUP BY`**. Compute both figures as window
aggregates partitioned by category and collapse the 10,000 result rows with
`SELECT DISTINCT`.

The answer is identical to the `GROUP BY` version; the reading explains what
that costs and when the trick is nonetheless the right one.

**Ordered by `category` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 91_drills_windows_2 ex7`

## Exercise 8 - how concentrated is each category

For each category, its best-selling product by revenue and that product's
share of the category. Compute revenue as `sum(quantity * price)` per product
from `order_items` joined to `products`, then use one window for the category
total and another to pick the leader (ties broken by the smaller
`product_id`).

Columns, in this order: `category`, `product_id`, `revenue` rounded to 2,
`category_revenue` rounded to 2, `pct_of_category` =
`round(100 * revenue / category_revenue, 3)`.

Divide the raw values, not the rounded ones.

**Ordered by `category` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 91_drills_windows_2 ex8`

## The gate

```python
"""Gates for 91_drills_windows_2. Quoted verbatim in README.md."""
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
compares the rows **in order**. Each reference solves the same problem with a
join to a derived aggregate instead of a window - the pre-window spelling -
which is a useful thing to be able to read even when you would never write it.

Next: **92_drills_windows_3**, on running totals and the window's own
`ORDER BY`.
