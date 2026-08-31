# 94 - Drills: window frames

Eight problems from lesson 16 on the third part of an `OVER` clause: the
frame. `PARTITION BY` says which rows are in play and `ORDER BY` puts them in
a line; the frame says how far along that line the aggregate may look from
each row. Get it explicit and moving averages, trailing sums and
"still-to-come" totals all fall out of the same syntax.

## Exercise 1 - a centred three-month average

Monthly revenue smoothed by averaging each month with its immediate
neighbours. Columns, in this order: `month` = `date_trunc('month',
created_at)`, `revenue` = `sum(total)` rounded to 2, `ma3` =
`round(avg(revenue) OVER (ORDER BY month ROWS BETWEEN 1 PRECEDING AND 1
FOLLOWING), 2)`.

The first and last months average over two values, not three.

**Ordered by `month` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 94_drills_frames_1 ex1`

## Exercise 2 - a trailing three-month sum

Monthly order counts with a rolling total of this month and the two before.
Columns, in this order: `month`, `orders`, `trailing3` = `sum(orders) OVER
(ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`.

**Ordered by `month` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 94_drills_frames_1 ex2`

## Exercise 3 - the default frame, written out

Monthly revenue with a running total and a high-water mark, both using an
explicit `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. Columns, in this
order: `month`, `revenue` rounded to 2, `running_revenue` rounded to 2,
`best_so_far` = the largest single month's revenue up to and including this
one, rounded to 2.

The reference omits the frame entirely and gets the same answer - the reading
explains exactly when that is safe.

**Ordered by `month` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 94_drills_frames_1 ex3`

## Exercise 4 - looking forward instead of back

Monthly revenue with the revenue that is still ahead. Columns, in this order:
`month`, `revenue` rounded to 2, `revenue_from_here` = `sum(revenue)` over
`ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING` rounded to 2, and
`months_from_here` = `count(*)` over the same frame.

The first row's `revenue_from_here` is the whole year; the last row's is its
own revenue.

**Ordered by `month` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 94_drills_frames_1 ex4`

## Exercise 5 - a moving average inside each partition

Weekly revenue per order status, each with a four-week trailing average of its
own status. Columns, in this order: `week` = `date_trunc('week', created_at)`,
`status`, `revenue` rounded to 2, `ma4` = `round(avg(revenue) OVER (PARTITION
BY status ORDER BY week ROWS BETWEEN 3 PRECEDING AND CURRENT ROW), 2)`.

**Ordered by `status` ascending, then `week` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 94_drills_frames_1 ex5`

## Exercise 6 - ROWS against RANGE

Every review of product 77, with two cumulative sums of `rating` that differ
only in their frame mode. Columns, in this order: `id`, `rating`, `sum_rows` =
`sum(rating) OVER (ORDER BY rating, id ROWS BETWEEN UNBOUNDED PRECEDING AND
CURRENT ROW)`, `sum_range` = `sum(rating) OVER (ORDER BY rating RANGE BETWEEN
UNBOUNDED PRECEDING AND CURRENT ROW)`.

Write both exactly as given. Rows sharing a rating get distinct `sum_rows` and
an identical `sum_range`.

**Ordered by `rating` ascending, then `id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 94_drills_frames_1 ex6`

## Exercise 7 - days that beat their own trend

Take the orders created on or after 2023-09-16, total them by day, attach a
seven-day trailing average (`ROWS BETWEEN 6 PRECEDING AND CURRENT ROW`), and
return only the days whose own revenue exceeded that average. Columns, in this
order: `day` = `date_trunc('day', created_at)`, `revenue` rounded to 2, `ma7`
rounded to 2.

Compare the raw values; round only in the output.

**Ordered by `day` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 94_drills_frames_1 ex7`

## Exercise 8 - a moving-average crossover

Weekly revenue with a short and a long trailing average and the signal they
generate. Columns, in this order: `week`, `revenue` rounded to 2, `ma4` = the
four-week trailing average rounded to 2, `ma12` = the twelve-week trailing
average rounded to 2, and `signal` = the text `'above'` when the raw `ma4`
exceeds the raw `ma12`, otherwise `'below'`.

Compare the unrounded averages.

**Ordered by `week` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 94_drills_frames_1 ex8`

## The gate

```python
"""Gates for 94_drills_frames_1. Quoted verbatim in README.md."""
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
compares the rows **in order**. Six of the references rebuild the same frames
as correlated subqueries with a date range - which is what a frame means when
the series has no gaps, and a useful reminder that it is not what a frame
means when it does.

This is the last set on subqueries, CTEs and windows. Next:
**95_drills_lag_lead_1**, on `lag()` and `lead()`.
