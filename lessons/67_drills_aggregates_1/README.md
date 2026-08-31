# 67 - Drills: aggregates, set 1

Eight problems on lesson 06's five workhorses - `count`, `sum`, `min`, `max`,
`avg` - plus `DISTINCT` and `FILTER`. Every one of them returns a single row,
because that is what a bare aggregate query does, and the whole set is about
being precise on what exactly is being counted. If the difference between
`count(*)` and `count(col)` is not automatic yet, reread 06 first.

## Exercise 1 - the shape of one category

One row describing the `garden` products: `products` = how many there are,
`cheapest` = the lowest price, `dearest` = the highest price, and
`avg_price` = the average price rounded to 2 decimal places, in that column
order.

Edit `ex1/solution.sql`. Run: `uv run dojo test 67_drills_aggregates_1 ex1`

## Exercise 2 - how many rows, how many things

Over the 1-star rows of `reviews`, return one row with `one_star` = how many
such reviews exist and `products_hit` = how many distinct products they are
spread across, in that column order.

Edit `ex2/solution.sql`. Run: `uv run dojo test 67_drills_aggregates_1 ex2`

## Exercise 3 - summing a computed column

Over the rows of `order_items` whose `product_id` is 100 or less, return
`lines` = the number of item rows, `units` = the total `quantity`, and
`revenue` = the sum of `quantity * price` rounded to 2, in that column order.

Edit `ex3/solution.sql`. Run: `uv run dojo test 67_drills_aggregates_1 ex3`

## Exercise 4 - min and max on timestamps

One row describing the time span covered by `orders`: `first_order` =
`min(created_at)`, `last_order` = `max(created_at)`, and `span_days` = the
number of whole days between them, computed by casting both to `date` and
subtracting.

Edit `ex4/solution.sql`. Run: `uv run dojo test 67_drills_aggregates_1 ex4`

## Exercise 5 - several slices, one row

One row over all of `products`: `products` = the total number of rows,
`cheap` = how many cost less than 50, `dear` = how many cost more than 450,
and `avg_electronics` = the average price of the electronics products,
rounded to 2 - in that column order.

Use `FILTER (WHERE ...)` rather than four separate queries.

Edit `ex5/solution.sql`. Run: `uv run dojo test 67_drills_aggregates_1 ex5`

## Exercise 6 - distinct counts skip the NULLs

One row about `staff`: `staff` = the number of rows, `managers` = the number
of distinct `manager_id` values, `departments` = the number of distinct
departments, and `payroll` = the sum of all salaries, in that column order.

Note that `managers` counts values, not rows - so the CEO's missing manager
does not become an entry.

Edit `ex6/solution.sql`. Run: `uv run dojo test 67_drills_aggregates_1 ex6`

## Exercise 7 - a percentage that is not zero

One row of order KPIs: `paid_pct` = paid orders as a percentage of all
orders, rounded to 2 decimal places; `avg_paid` = the average `total` of paid
orders rounded to 2; `avg_other` = the average `total` of every order that is
not paid, rounded to 2 - in that column order.

Write the percentage as `100.0 * <paid count> / <total count>`, with the
decimal point, and rounded to 2.

Edit `ex7/solution.sql`. Run: `uv run dojo test 67_drills_aggregates_1 ex7`

## Exercise 8 - an average of counts

How many item lines does an order carry, on average, when orders with no
items count as zero? Restrict to orders whose `id` is 5000 or less.

Return one row: `avg_items` = the average number of lines per order rounded
to 4 decimal places, `max_items` = the largest number of lines on any of
those orders, and `empty_orders` = how many of them have no items at all.

Count the lines per order first, in a subquery, then aggregate that result.
An outer join is what keeps the empty orders in the picture.

Edit `ex8/solution.sql`. Run: `uv run dojo test 67_drills_aggregates_1 ex8`

## The gate

```python
"""Gates for 67_drills_aggregates_1. Quoted verbatim in README.md."""
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
compares the rows. None of these prompts names an ordering - a single row
cannot be out of order - so the comparison is unordered and only the values
and the number of columns matter.

Next: **68_drills_aggregates_2**, on aggregate arithmetic and the `DISTINCT`
family.
