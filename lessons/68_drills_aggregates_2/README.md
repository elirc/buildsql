# 68 - Drills: aggregates, set 2

Set 1 drilled which rows go into an aggregate. These eight drill the
arithmetic that happens once they are in there - weighted averages, averages
that fill blanks with zero, shares of a total, and aggregates computed on top
of other aggregates. Source lesson is 06; the last two also lean on the
subquery habit from 13.

## Exercise 1 - one product's reviews

One row summarising the reviews of product 42: `reviews` = how many there
are, `avg_rating` = the average rating rounded to 2 decimal places, `worst` =
the lowest rating, `best` = the highest, in that column order.

Edit `ex1/solution.sql`. Run: `uv run dojo test 68_drills_aggregates_2 ex1`

## Exercise 2 - the shape of the customer table

One row about `customers`: `customers` = the number of rows, `countries` =
the number of distinct countries, `first_signup` = the earliest
`created_at`, `last_signup` = the latest, in that column order.

Edit `ex2/solution.sql`. Run: `uv run dojo test 68_drills_aggregates_2 ex2`

## Exercise 3 - units, revenue, and the average line

Over the `order_items` rows belonging to orders with `order_id` of 2000 or
less: `units` = the total quantity, `revenue` = the sum of
`quantity * price` rounded to 2, and `avg_line` = the average of
`quantity * price` rounded to 2, in that column order.

Edit `ex3/solution.sql`. Run: `uv run dojo test 68_drills_aggregates_2 ex3`

## Exercise 4 - zero-filled average versus filtered average

Two averages of the same column over `orders`, which are not the same number:

- `avg_zero_filled` = the average of `total` across **all** orders, with
  non-paid orders contributing 0. Write it as
  `avg(CASE WHEN status = 'paid' THEN total ELSE 0 END)`, rounded to 2.
- `avg_paid_only` = the average of `total` over only the paid orders,
  rounded to 2.
- `paid_orders` = how many paid orders there are.

Return them in that column order, in one row.

Edit `ex4/solution.sql`. Run: `uv run dojo test 68_drills_aggregates_2 ex4`

## Exercise 5 - weighted versus unweighted

Over the `order_items` rows with `product_id` of 500 or less, return
`weighted_unit_price` = `sum(quantity * price) / sum(quantity)` rounded to 4
decimal places, `plain_avg_price` = `avg(price)` rounded to 4, and `units` =
the total quantity, in that column order.

The first two numbers are both "the average price" and they are not equal.

Edit `ex5/solution.sql`. Run: `uv run dojo test 68_drills_aggregates_2 ex5`

## Exercise 6 - distinct counting with a filter on top

One row over `orders`: `orders` = the row count, `customers` = how many
distinct customers appear, `cancellers` = how many distinct customers appear
among the cancelled orders, and `months` = how many distinct values
`date_trunc('month', created_at)` takes - in that column order.

Edit `ex6/solution.sql`. Run: `uv run dojo test 68_drills_aggregates_2 ex6`

## Exercise 7 - a share of the total, in one pass

Over the `order_items` rows with `product_id` of 200 or less, return
`revenue` = the sum of `quantity * price` rounded to 2, `single_unit_revenue`
= the same sum restricted to lines with `quantity = 1`, rounded to 2, and
`single_unit_pct` = the second as a percentage of the first, rounded to 2 -
in that column order.

Write the percentage with `100.0` so the division is not integer division.

Edit `ex7/solution.sql`. Run: `uv run dojo test 68_drills_aggregates_2 ex7`

## Exercise 8 - the aggregate of an aggregate

How lopsided is review coverage within the `food` category? Count the reviews
per product first (only products that have at least one review can appear),
then describe that distribution in one row: `products_reviewed` = how many
products it covers, `max_reviews` = the largest count, `min_reviews` = the
smallest, `avg_reviews` = the average count rounded to 2 - in that column
order.

Edit `ex8/solution.sql`. Run: `uv run dojo test 68_drills_aggregates_2 ex8`

## The gate

```python
"""Gates for 68_drills_aggregates_2. Quoted verbatim in README.md."""
from dojo import grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(shared_lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=False)


def test_ex2(shared_lesson_db):
    ex = L.exercise("ex2")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=False)


def test_ex3(shared_lesson_db):
    ex = L.exercise("ex3")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=False)


def test_ex4(shared_lesson_db):
    ex = L.exercise("ex4")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=False)


def test_ex5(shared_lesson_db):
    ex = L.exercise("ex5")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=False)


def test_ex6(shared_lesson_db):
    ex = L.exercise("ex6")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=False)


def test_ex7(shared_lesson_db):
    ex = L.exercise("ex7")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=False)


def test_ex8(shared_lesson_db):
    ex = L.exercise("ex8")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=False)
```

Every gate runs the reference query and yours against the same clone and
compares rows. All of these results are a single row, so the comparison is
unordered - what it checks is the number of columns, their order, and the
values, which is why each prompt spells the column order out.

Next: **69_drills_aggregates_3**, the FILTER-heavy set: KPI rows, NULL-aware
counting, and aggregates over a join.
