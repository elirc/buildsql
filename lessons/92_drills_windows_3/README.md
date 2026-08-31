# 92 - Drills: window functions 3 - running totals

Eight problems from lesson 16 on what happens when you put an `ORDER BY`
inside an `OVER` clause. An aggregate that covered the whole partition
suddenly covers "everything up to here", and that one change turns `sum` into
a running total, `count` into a running count and `max` into a high-water
mark. Exercise 4 is the one that catches everybody.

## Exercise 1 - a running total over six rows

Categories by product count, largest first, with the count accumulating down
the list. Columns, in this order: `category`, `products`, `running_products` =
`sum(products) OVER (ORDER BY products DESC, category)`.

The last row's running total must equal 10,000 at full scale.

**Ordered by `products` descending, then `category` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 92_drills_windows_3 ex1`

## Exercise 2 - headcount over time

Every member of staff in hiring order, with the company's headcount as of that
hire. Columns, in this order: `id`, `name`, `hired_on`, `hires_to_date` =
`count(*) OVER (ORDER BY hired_on, id)`.

**Ordered by `hired_on` ascending, then `id` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 92_drills_windows_3 ex2`

## Exercise 3 - a running total that restarts per customer

Every order of customers 1 to 8, with that customer's spend accumulating
through their own order history. Columns, in this order: `customer_id`, `id`,
`created_at`, `total`, `running_spend` = `round(sum(total) OVER (PARTITION BY
customer_id ORDER BY created_at, id), 2)`.

**Ordered by `customer_id` ascending, then `created_at` ascending, then `id`
ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 92_drills_windows_3 ex3`

## Exercise 4 - two running totals that disagree

Every member of staff with two accumulating salary columns that differ only in
their window's `ORDER BY`. Columns, in this order: `id`, `name`, `department`,
`salary`, `running_by_department` = `round(sum(salary) OVER (ORDER BY
department), 2)`, `running_by_row` = `round(sum(salary) OVER (ORDER BY
department, id), 2)`.

Write both exactly as given. Everyone in a department shares one value in the
first column and gets a distinct value in the second - the reading explains
why, and it is the single most important thing in this set.

**Ordered by `department` ascending, then `id` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 92_drills_windows_3 ex4`

## Exercise 5 - how much of the year is behind us

Monthly revenue with a running total and a running share. Columns, in this
order: `month` = `date_trunc('month', created_at)`, `revenue` = `sum(total)`
rounded to 2, `running_revenue` = the accumulated revenue rounded to 2, and
`running_pct` = `round(100 * <running revenue> / <total revenue>, 2)`.

The denominator is a second window over the same rows, this time with no
`ORDER BY`.

**Ordered by `month` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 92_drills_windows_3 ex5`

## Exercise 6 - the same thing by week

Weekly order volume and revenue with revenue accumulating. Columns, in this
order: `week` = `date_trunc('week', created_at)`, `orders`, `revenue` rounded
to 2, `running_revenue` rounded to 2.

**Ordered by `week` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 92_drills_windows_3 ex6`

## Exercise 7 - accumulate in two different orders at once

Monthly revenue with two running totals over the same thirteen rows: one
walking the months in calendar order, one walking them from the most
profitable month down. Columns, in this order: `month`, `revenue` rounded to
2, `running_by_month` = `round(sum(revenue) OVER (ORDER BY month), 2)`,
`running_by_size` = `round(sum(revenue) OVER (ORDER BY revenue DESC, month),
2)`.

**Ordered by `month` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 92_drills_windows_3 ex7`

## Exercise 8 - the countries that make up 80% of the customer base

Rank the countries by customer count, accumulate, and keep only the rows whose
cumulative share is 80% or less. Columns, in this order: `country`,
`customers`, `running_customers` = the accumulated count ordered by
`customers` descending then `country` ascending, `cum_pct` =
`round(100.0 * running_customers / <all customers>, 2)`.

Filtering on a window result needs one more query level.

**Ordered by `running_customers` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 92_drills_windows_3 ex8`

## The gate

```python
"""Gates for 92_drills_windows_3. Quoted verbatim in README.md."""
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
compares the rows **in order**. Six of the eight references compute the same
running totals with a correlated subquery over a small named result, which is
how this was done before window functions and is a fair description of what
`OVER (ORDER BY ...)` means.

Next: **93_drills_windows_4**, on `NTILE`, shares of a partition, and windows
over joins.
