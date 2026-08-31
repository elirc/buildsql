# 100 - Drills: dates and times, set 2

Eight more problems on lesson 18, past the basics: epochs, `to_char`
patterns, buckets that `date_trunc` does not offer, intervals turned into
numbers, and two reports whose whole difficulty is a date. Do 99 first - this
set assumes `date_trunc`, `extract`, half-open ranges and `age()` are
automatic.

## Exercise 1 - the timestamp as a number

For the orders with `id <= 15` return `id`, `created_at`, and
`epoch_seconds` = the number of seconds since 1970-01-01 UTC, as a
`bigint`.

**Ordered by `id` ascending.** (15 rows.)

Edit `ex1/solution.sql`. Run: `uv run dojo test 100_drills_dates_2 ex1`

## Exercise 2 - two formats side by side

For the orders with `id <= 15` return `id`, `stamp` = `created_at` formatted
as `YYYY-MM-DD HH24:MI`, and `day_name` = the unpadded English weekday name
of that order.

**Ordered by `id` ascending.** (15 rows.)

Edit `ex2/solution.sql`. Run: `uv run dojo test 100_drills_dates_2 ex2`

## Exercise 3 - grouping by a formatted month

One row per month of `orders`, keyed by text this time: `month` =
`to_char(created_at, 'YYYY-MM')` and `orders` = how many orders fell in it.

`YYYY-MM` is the one text month format that sorts correctly, which is why it
is the only one worth grouping by.

**Ordered by `month` ascending.** (13 rows.)

Edit `ex3/solution.sql`. Run: `uv run dojo test 100_drills_dates_2 ex3`

## Exercise 4 - a bucket `date_trunc` does not offer

For the events with `id <= 20000`, count them in quarter-hour buckets.
Return `bucket` = the timestamp of the start of the 15-minute block (that
is, the hour truncated plus whole 15-minute steps) and `events` = how many
fell in it.

**Ordered by `bucket` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 100_drills_dates_2 ex4`

## Exercise 5 - an interval turned into a number

For every member of the `support` department return `id`, `name`,
`hired_on`, and `tenure_months` = whole months of tenure at 2023-11-14,
computed from `age()` as `years * 12 + months`, as an `int`.

**Ordered by `tenure_months` descending, then `id` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 100_drills_dates_2 ex5`

## Exercise 6 - one week, exactly

For the orders created in the week beginning Monday 2023-03-13 - that is,
from 2023-03-13 up to but not including 2023-03-20 - return one row per day:
`day` = `created_at` cast to `date`, `orders` = how many, and `revenue` =
the sum of `total` rounded to 2.

**Ordered by `day` ascending.** (7 rows.)

Edit `ex6/solution.sql`. Run: `uv run dojo test 100_drills_dates_2 ex6`

## Exercise 7 - how long until the first order

For the customers with `id <= 100` return `customer_id`, `signed_up` =
`customers.created_at` as a `date`, `first_order` = the date of their
earliest order, and `days_to_first` = the number of days between the two.

Customers who never ordered must still appear, with NULL in the last two
columns.

**Ordered by `customer_id` ascending.** (100 rows.)

Edit `ex7/solution.sql`. Run: `uv run dojo test 100_drills_dates_2 ex7`

## Exercise 8 - sessions from a gap rule

For the customers with `customer_id <= 5` in `events`, split their activity
into sessions: a new session starts at a customer's first event, and again
whenever more than 30 minutes have passed since their previous event.
Return `customer_id`, `events` = their total number of events, and
`sessions` = how many sessions that rule produces.

**Ordered by `customer_id` ascending.** (5 rows.)

Edit `ex8/solution.sql`. Run: `uv run dojo test 100_drills_dates_2 ex8`

## The gate

```python
"""Gates for 100_drills_dates_2. Quoted verbatim in README.md."""
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

Next: **101_drills_series_1**, where the calendar comes from
`generate_series` instead of from the data.
