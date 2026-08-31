# 98 - Drills: conditional aggregates and pivots, set 2

Eight more problems on lesson 17, one step harder than set 97. Here the
pivots run over joined data, carry averages and booleans rather than counts,
and twice run backwards: two of these exercises **un-pivot**, turning a wide
row of columns back into one row per value. If `FILTER` still feels
unfamiliar, do 97 first.

## Exercise 1 - averages of subsets

For each product `category` return `category`, `avg_price` = the average
price rounded to 2, `avg_cheap` = the average price of its products under
100 rounded to 2, and `avg_dear` = the average price of its products at 400
or more, rounded to 2.

**Ordered by `category` ascending.** (6 rows.)

Edit `ex1/solution.sql`. Run: `uv run dojo test 98_drills_pivots_2 ex1`

## Exercise 2 - weekday against weekend

For each `orders.status` return `status`, `orders` = the total number of
orders with that status, `weekend` = how many of them were created on a
Saturday or Sunday (`extract(dow FROM created_at)` is 6 or 0), and `weekday`
= how many on the other five days.

**Ordered by `status` ascending.** (4 rows.)

Edit `ex2/solution.sql`. Run: `uv run dojo test 98_drills_pivots_2 ex2`

## Exercise 3 - a yes/no column

For each `staff` department return `department`, `headcount`, `top_earners`
= how many of them earn 100000 or more, and `all_hired_before_2022` = a
boolean that is true when the department has nobody hired on or after
2022-01-01.

Derive the boolean from the aggregates rather than from a second query.

**Ordered by `department` ascending**, one row per department that has staff.

Edit `ex3/solution.sql`. Run: `uv run dojo test 98_drills_pivots_2 ex3`

## Exercise 4 - sentiment by category

Join `reviews` to `products` and return one row per product `category`:
`category`, `reviews` = how many reviews its products received, `negative` =
how many rated 1 or 2, `neutral` = how many rated 3, `positive` = how many
rated 4 or 5, and `avg_rating` = the average rating rounded to 3.

**Ordered by `category` ascending.** (6 rows.)

Edit `ex4/solution.sql`. Run: `uv run dojo test 98_drills_pivots_2 ex4`

## Exercise 5 - the same numbers, tall instead of wide

Build the price-band grid - per `category`, the number of products priced
under 100 (`cheap`), from 100 up to but not including 300 (`mid`), and 300
or more (`dear`) - and then **un-pivot** it: return one row per category and
band, with columns `category`, `band` (the text `cheap`, `mid` or `dear`),
and `products`.

**Ordered by `category` ascending, then `band` ascending** - alphabetically,
so `cheap`, `dear`, `mid`. (18 rows.)

Edit `ex5/solution.sql`. Run: `uv run dojo test 98_drills_pivots_2 ex5`

## Exercise 6 - the grid transposed

Same data as ex4, pivoted the other way round: one row per `rating` (1 to
5), with six columns named `books`, `clothing`, `electronics`, `food`,
`garden`, `toys` counting the reviews of that rating whose product is in
that category.

**Ordered by `rating` ascending.** (5 rows.)

Edit `ex6/solution.sql`. Run: `uv run dojo test 98_drills_pivots_2 ex6`

## Exercise 7 - new against returning

One row per month of `orders`. Return `month` =
`date_trunc('month', created_at)`, `orders` = the orders created that month,
`new_customers` = how many distinct customers placed their **first ever**
order that month, and `returning_customers` = how many distinct customers
ordered that month whose first ever order was in an earlier month.

A customer counts once per month, in exactly one of the two columns.

**Ordered by `month` ascending.** (13 rows.)

Edit `ex7/solution.sql`. Run: `uv run dojo test 98_drills_pivots_2 ex7`

## Exercise 8 - pivot, un-pivot, then rank

Build the monthly status grid from 97's ex3 (`month`, plus a count column
for each of `pending`, `paid`, `shipped`, `cancelled`), un-pivot it into one
row per month and status, and keep only each month's most common status.
Return `month`, `status`, and `orders`.

Break ties by `status` ascending, so exactly one row survives per month.

**Ordered by `month` ascending.** (13 rows.)

Edit `ex8/solution.sql`. Run: `uv run dojo test 98_drills_pivots_2 ex8`

## The gate

```python
"""Gates for 98_drills_pivots_2. Quoted verbatim in README.md."""
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
compares rows. All eight prompts state an ordering, so all eight are graded
with `ordered=True`.

Next: **99_drills_dates_1**, on truncating, extracting and subtracting
timestamps.
