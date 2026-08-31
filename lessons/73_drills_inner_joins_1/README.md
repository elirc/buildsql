# 73 - Drills: inner joins, set 1

Eight problems on lesson 08: joining on a key, aliasing tables, deciding
whether a condition is a join key or a filter, and aggregating across the
join. The first three are two-table lookups, the middle three aggregate over
a join, and the last two add a third table and a second grouping key.

## Exercise 1 - orders with a human name on them

For every order with `id` of 50 or less, return the order's `id`, the
customer's `name`, the customer's `country`, and the order's `total` - in
that column order.

**Ordered by the order `id` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 73_drills_inner_joins_1 ex1`

## Exercise 2 - joining a child back to its parent

For every `order_items` row with `id` of 30 or less, return the item's `id`,
its `order_id`, the parent order's `status`, the item's `quantity`, and the
parent order's `total` - in that column order.

**Ordered by the item `id` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 73_drills_inner_joins_1 ex2`

## Exercise 3 - a filter on the other table

Find the angry reviews of garden products from November 2023: every `reviews`
row with `rating = 1` whose `created_at` is on or after 2023-11-01, for a
product in the `garden` category.

Return the review's `id`, the product's `name`, the review's `rating`, and
its `created_at` - in that column order.

**Ordered by the review `id` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 73_drills_inner_joins_1 ex3`

## Exercise 4 - aggregating across the join

How much cancelled business does each country represent? Join `orders` to
`customers`, keep only the cancelled orders, and return `country`,
`cancelled_orders` = how many there are, and `cancelled_value` = the sum of
their totals rounded to 2.

**Ordered by `country` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 73_drills_inner_joins_1 ex4`

## Exercise 5 - joining the event stream

Where do the purchases come from? Join `events` to `customers` and, over the
events with `id` of 200000 or less whose `event_type` is `'purchase'`, return
`country`, `events` = how many such events that country produced, and
`actives` = how many distinct customers produced them.

**Ordered by `country` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 73_drills_inner_joins_1 ex5`

## Exercise 6 - join, group, threshold

Which products have collected more than 130 reviews? Join `reviews` to
`products` and return the product's `id`, its `name`, and `reviews` = how
many reviews it has, keeping only the products above the threshold.

**Ordered by `reviews` descending, then by product `id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 73_drills_inner_joins_1 ex6`

## Exercise 7 - three tables, one customer

Show everything customer 777 ever bought. Join `orders` to `order_items` and
on to `products`, restricted to that customer's orders, and return the item's
`id`, the order's `id`, the product's `name`, the item's `quantity`, and
`line_value` = `quantity * price` from the item row, rounded to 2 - in that
column order.

**Ordered by the order `id` ascending, then the item `id` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 73_drills_inner_joins_1 ex7`

## Exercise 8 - two grouping keys across a join

For the customers in the United States and Great Britain only, break their
orders down by country and status: return `country`, `status`, `orders` = the
row count, and `revenue` = `sum(total)` rounded to 2.

Use `c.country IN ('US', 'GB')` for the restriction.

**Ordered by `country` ascending, then `status` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 73_drills_inner_joins_1 ex8`

## The gate

```python
"""Gates for 73_drills_inner_joins_1. Quoted verbatim in README.md."""
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
compares rows in the order each prompt names. A join that produces too many
rows - the classic symptom of a missing or wrong `ON` condition - shows up in
the failure message as a row count several times larger than expected, which
is usually the fastest diagnosis you will get.

Next: **74_drills_inner_joins_2**, three and four tables at a time, and the
arithmetic that joins do to your counts.
