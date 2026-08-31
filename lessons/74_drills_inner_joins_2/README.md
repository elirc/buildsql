# 74 - Drills: inner joins, set 2

Set 1 joined two tables and grouped the result. These eight chain three and
four of them, which is where joins start doing arithmetic to your numbers:
one order with three lines becomes three rows, and every `count(*)` and
`sum()` above that join has to be written knowing it. Lesson 08 is the
source, with 06 and 07 supplying the aggregation.

## Exercise 1 - the three-table chain

For every order with `id` of 40 or less, list its item lines with the product
name attached. Return the item's `id`, the order's `id`, the order's
`status`, the product's `name`, and the item's `quantity` - in that column
order.

**Ordered by the order `id` ascending, then the item `id` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 74_drills_inner_joins_2 ex1`

## Exercise 2 - one row per order, counted from its lines

Summarise customer 1234's orders. Join `customers`, `orders` and
`order_items`, and return the customer's `name`, the order's `id`, `lines` =
how many item lines that order has, and `units` = the total quantity across
those lines - in that column order.

Orders with no item lines cannot appear in an inner-joined result, and that
is expected here.

**Ordered by the order `id` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 74_drills_inner_joins_2 ex2`

## Exercise 3 - revenue per category, paid orders only

Join `order_items` to `orders` and to `products`, keep only the lines
belonging to orders with status `'paid'`, and return `category`, `revenue` =
the sum of `quantity * price` from the item rows rounded to 2, and `lines` =
how many item lines contributed.

**Ordered by `category` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 74_drills_inner_joins_2 ex3`

## Exercise 4 - counting people through two joins

For orders created in October 2023 - `created_at` on or after 2023-10-01 and
before 2023-11-01 - return per product category: `category`, `buyers` = how
many distinct customers bought from that category, and `lines` = how many
item lines those purchases produced.

**Ordered by `category` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 74_drills_inner_joins_2 ex4`

## Exercise 5 - lines, orders and units are three different numbers

Look only at item lines for products priced above 450. Return `category`,
`item_lines` = how many such lines exist, `orders_touched` = how many
distinct orders they belong to, and `units` = the total quantity sold.

**Ordered by `category` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 74_drills_inner_joins_2 ex5`

## Exercise 6 - HAVING over a join

Ignoring cancelled orders, which countries have an average order total above
1005? Join `orders` to `customers` and return `country`, `orders` = the row
count, and `avg_order` = the average total rounded to 2, keeping only the
countries whose unrounded average exceeds 1005.

**Ordered by `country` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 74_drills_inner_joins_2 ex6`

## Exercise 7 - four tables

What did customer 4242 spend, by category? Join `customers`, `orders`,
`order_items` and `products`, restricted to that customer, and return the
customer's `name`, the product `category`, `lines` = how many item lines fall
in it, and `spend` = the sum of `quantity * price` rounded to 2.

**Ordered by `category` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 74_drills_inner_joins_2 ex7`

## Exercise 8 - a cancelled-share report across three tables

For the `books` and `toys` categories only, how much of the demand gets
cancelled? Join `order_items`, `orders` and `products` and return `category`,
`lines` = how many item lines the category has, `cancelled_lines` = how many
of them belong to a cancelled order, and `cancelled_pct` = the second as a
percentage of the first, rounded to 2.

Restrict with `p.category IN ('books', 'toys')`, and write the percentage
with `100.0` so it is not integer division.

**Ordered by `category` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 74_drills_inner_joins_2 ex8`

## The gate

```python
"""Gates for 74_drills_inner_joins_2. Quoted verbatim in README.md."""
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
compares rows in the order each prompt names. If a total comes out roughly
twice what you expected, suspect the join before you suspect the aggregate:
a row that got duplicated by a one-to-many join is counted twice by
everything downstream of it.

Next: **75_drills_inner_joins_3**, which continues the multi-table work -
and after that the outer joins get sets of their own.
