# 101 - Drills: generated calendars, set 1

Eight problems on the one thing `GROUP BY` cannot do: report a period that
has no rows. Grouping invents nothing - a day with no orders simply does not
appear - so when a report must show every day, hour or bucket, the periods
have to come from somewhere else. That somewhere is `generate_series`, and
the pattern is always the same: generate the spine, `LEFT JOIN` the data to
it, and count the data's key so the empty periods come back as zero. Lesson
18 introduced it; this set makes it automatic.

## Exercise 1 - a month of days

Return a single column `day` containing every date in January 2023, from
2023-01-01 to 2023-01-31.

**Ordered by `day` ascending.** (31 rows.)

Edit `ex1/solution.sql`. Run: `uv run dojo test 101_drills_series_1 ex1`

## Exercise 2 - the twelve month starts

Return `month_start` = the first day of each month of 2023 as a `date`, and
`month_name` = its three-letter English abbreviation (`Jan`, `Feb`, ...).

**Ordered by `month_start` ascending.** (12 rows.)

Edit `ex2/solution.sql`. Run: `uv run dojo test 101_drills_series_1 ex2`

## Exercise 3 - every day of March, orders or not

For every date in March 2023 return `day` and `orders` = how many orders
were created that day, with 0 for any day that had none.

Generate the days; do not take them from `orders`.

**Ordered by `day` ascending.** (31 rows.)

Edit `ex3/solution.sql`. Run: `uv run dojo test 101_drills_series_1 ex3`

## Exercise 4 - all twenty-four hours

For 2023-05-10, return `hour` = the hour of day as an `int` from 0 to 23,
and `orders` = how many orders were created in that hour of that day, 0 if
none.

**Ordered by `hour` ascending.** (24 rows.)

Edit `ex4/solution.sql`. Run: `uv run dojo test 101_drills_series_1 ex4`

## Exercise 5 - the weeks nobody was hired

Generate the 52 weeks that start on Mondays from 2023-01-02 to 2023-12-25,
and return `week_start` for the weeks in which no member of `staff` was
hired - that is, no `hired_on` falls in `[week_start, week_start + 7)`.

**Ordered by `week_start` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 101_drills_series_1 ex5`

## Exercise 6 - a histogram with empty bars

Generate the price buckets 0, 50, 100, ... 450 and return `bucket_start`
together with `products` = how many products are priced in
`[bucket_start, bucket_start + 50)`, 0 for an empty bucket.

**Ordered by `bucket_start` ascending.** (10 rows.)

Edit `ex6/solution.sql`. Run: `uv run dojo test 101_drills_series_1 ex6`

## Exercise 7 - a running total over a calendar

For every date in February 2023 return `day`, `orders` = the orders created
that day (0 if none), and `running_orders` = the cumulative number of orders
from 2023-02-01 up to and including that day.

**Ordered by `day` ascending.** (28 rows.)

Edit `ex7/solution.sql`. Run: `uv run dojo test 101_drills_series_1 ex7`

## Exercise 8 - a dense grid, two dimensions

For each of the three departments `engineering`, `sales`, `support` and each
month of 2023, return `department`, `month_start`, and `hires` = how many
staff of that department were hired in that month, 0 when none were.

Every combination must appear, so the spine is the departments crossed with
the months.

**Ordered by `department` ascending, then `month_start` ascending.** (36
rows.)

Edit `ex8/solution.sql`. Run: `uv run dojo test 101_drills_series_1 ex8`

## The gate

```python
"""Gates for 101_drills_series_1. Quoted verbatim in README.md."""
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
compares rows. All eight prompts name an ordering, so all eight are graded
with `ordered=True` - `generate_series` does emit its rows in order, but a
join against it makes no such promise.

Next: **102_drills_text_1**, on the string functions.
