# 95 - Drills: LAG and LEAD, set 1

Eight problems on looking sideways: `lag()` and `lead()` from lesson 16 -
previous row, next row, offsets, and the deltas and gaps built from them.
Every problem here is "this row compared to a neighbouring row"; if the NULL
at the edge of a series or the ORDER BY inside `OVER` still feels wobbly,
reread 16 before starting.

## Exercise 1 - yesterday's number beside today's

Paid orders per day for September 2023 (half-open range, as always). For
each day return `day` = `date_trunc('day', created_at)`, `orders` = how many
paid orders that day, and `prev_day` = the previous day's count via LAG
(NULL on September 1st).

**Ordered by `day` ascending.** (30 rows.)

Edit `ex1/solution.sql`. Run: `uv run dojo test 95_drills_lag_lead_1 ex1`

## Exercise 2 - the next hire

For the engineering department, list every staff member with the date the
department's **next** hire arrived. Return `id`, `name`, `hired_on`, and
`next_hire` = the `hired_on` of the next engineer by hire date via LEAD,
breaking hire-date ties by `id` - NULL for the newest hire.

**Ordered by `hired_on` ascending, then `id` ascending.** (112 rows.)

Edit `ex2/solution.sql`. Run: `uv run dojo test 95_drills_lag_lead_1 ex2`

## Exercise 3 - the same weekday last week

Daily revenue from shipped orders for August 2023: `day` =
`date_trunc('day', created_at)`, `revenue` = the sum of `total` that day,
and `week_ago` = the revenue from **seven rows earlier** via LAG's offset
argument (NULL for the first seven days).

**Ordered by `day` ascending.** (31 rows.)

Edit `ex3/solution.sql`. Run: `uv run dojo test 95_drills_lag_lead_1 ex3`

## Exercise 4 - the gap between two orders

How long does customer 42 wait between orders? For every order of customer
42 return `id`, `created_at`, and `since_prev` = this order's `created_at`
minus the previous order's (an interval, NULL for the first order), taking
orders in `created_at` order with `id` as the tie-break.

**Ordered by `created_at` ascending, then `id` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 95_drills_lag_lead_1 ex4`

## Exercise 5 - a LAG that restarts per group

Among products priced 495.00 or more, walk each category's price ladder.
Return `category`, `id`, `price`, and `prev_in_cat` = the price of the
previous product **within the same category** by (`price`, `id`) order -
NULL for the cheapest of each category.

**Ordered by `category` ascending, then `price` ascending, then `id`
ascending.** (About a hundred rows.)

Edit `ex5/solution.sql`. Run: `uv run dojo test 95_drills_lag_lead_1 ex5`

## Exercise 6 - rating swings

Product 42's reviews, in arrival order: did opinion move? Return `id`,
`created_at`, `rating`, `prev_rating` = the previous review's rating, and
`shift` = `rating - prev_rating` (both NULL for the first review). Order
rows - and the window - by `created_at` with `id` as tie-break.

**Ordered by `created_at` ascending, then `id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 95_drills_lag_lead_1 ex6`

## Exercise 7 - the longest silence

For each of the customers with `id <= 5`: the longest stretch between two
consecutive events of theirs in the clickstream. Return `customer_id` and
`longest_gap` = the largest `ts`-to-`ts` gap between that customer's
consecutive events (an interval).

**Ordered by `customer_id` ascending.** (5 rows.)

Edit `ex7/solution.sql`. Run: `uv run dojo test 95_drills_lag_lead_1 ex7`

## Exercise 8 - local minima

The dip days of July 2023: days whose total order revenue was lower than
**both** the day before and the day after. Build daily revenue for July
(all statuses), attach both neighbours, and keep only the local minima.
Return `day` and `revenue`.

**Ordered by `day` ascending.** (July 1st and 31st can never qualify -
think about why before reading the hints.)

Edit `ex8/solution.sql`. Run: `uv run dojo test 95_drills_lag_lead_1 ex8`

## The gate

```python
"""Gates for 95_drills_lag_lead_1. Quoted verbatim in README.md."""
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
compares rows. Each prompt names an ordering - LAG and LEAD are only
meaningful over a stated order, so every one of these reports must end in
an `ORDER BY`, and all eight gates are graded with `ordered=True`.

Next: **96_drills_topn_1** - top-N and top-N-per-group, with the ties
handled honestly.
