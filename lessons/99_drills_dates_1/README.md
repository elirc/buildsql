# 99 - Drills: dates and times, set 1

Eight problems on lesson 18: truncating a timestamp to a bucket, pulling a
field out of it, subtracting two of them, and expressing a period as a
half-open range. Every date bug you will ever ship is one of those four done
carelessly, so this set is deliberately unglamorous. Reread 18 if
`date_trunc` and `extract` still blur into each other.

One convention throughout: a period is written `>= start AND < end`. Never
`BETWEEN` on a timestamp - `BETWEEN '2023-06-01' AND '2023-06-30'` silently
excludes almost all of the 30th, because a bare date means midnight.

## Exercise 1 - three views of one timestamp

For the orders with `id <= 20` return `id`, `created_at`, `order_date` =
`created_at` cast to `date`, and `hour_bucket` =
`date_trunc('hour', created_at)`.

**Ordered by `id` ascending.** (20 rows.)

Edit `ex1/solution.sql`. Run: `uv run dojo test 99_drills_dates_1 ex1`

## Exercise 2 - a month label

For the staff with `id <= 20` return `id`, `name`, `hired_on`, and
`hire_month` = the hire date formatted as `YYYY-MM` text, for example
`2019-04`.

**Ordered by `id` ascending.** (20 rows.)

Edit `ex2/solution.sql`. Run: `uv run dojo test 99_drills_dates_1 ex2`

## Exercise 3 - the quarterly numbers

One row per quarter of `orders`: `quarter` =
`date_trunc('quarter', created_at)`, `orders` = how many were created in it,
and `revenue` = the sum of `total` rounded to 2.

**Ordered by `quarter` ascending.** (5 rows - the data spans a little over
four quarters.)

Edit `ex3/solution.sql`. Run: `uv run dojo test 99_drills_dates_1 ex3`

## Exercise 4 - a month, day by day, with weekday names

For the orders created in June 2023, one row per calendar day: `day` =
`created_at` cast to `date`, `dow_name` = the English weekday name with no
padding (`Monday`, not `Monday   `), and `orders` = how many orders that
day.

Use a half-open range for June.

**Ordered by `day` ascending.** (30 rows.)

Edit `ex4/solution.sql`. Run: `uv run dojo test 99_drills_dates_1 ex4`

## Exercise 5 - tenure in days and years

For every member of the `engineering` department return `id`, `name`,
`hired_on`, `tenure_days` = the number of days from `hired_on` to
2023-11-14, and `tenure_years` = that day count divided by 365.0 and rounded
to 1.

Subtracting one `date` from another gives an integer number of days - no
cast, no `interval`.

**Ordered by `hired_on` ascending, then `id` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 99_drills_dates_1 ex5`

## Exercise 6 - the same span as an interval

For every member of the `sales` department return `id`, `name`, `hired_on`,
`tenure` = `age(DATE '2023-11-14', hired_on)`, and `full_years` = the whole
years of that interval as an `int`.

`age()` gives you years, months and days rather than a day count; the years
field is what a HR report calls a work anniversary.

**Ordered by `hired_on` ascending, then `id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 99_drills_dates_1 ex6`

## Exercise 7 - how long has this customer been with us

Among the customers with `customer_id <= 200` in `orders`, keep those whose
ordering history spans 300 days or more, and return `customer_id`,
`first_order` = their earliest `created_at` as a `date`, `last_order` = the
latest as a `date`, and `span_days` = the difference between those two
dates.

**Ordered by `span_days` descending, then `customer_id` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 99_drills_dates_1 ex7`

## Exercise 8 - the 30-day follow-up

For every order of customer 42 return `id`, `created_at`, and `within_30d` =
how many *other* orders that same customer placed strictly after this one
and strictly within 30 days of it (`created_at + interval '30 days'` is the
exclusive upper bound).

**Ordered by `created_at` ascending, then `id` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 99_drills_dates_1 ex8`

## The gate

```python
"""Gates for 99_drills_dates_1. Quoted verbatim in README.md."""
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
with `ordered=True`.

Next: **100_drills_dates_2**, on formatting, epochs, arbitrary buckets and
intervals.
