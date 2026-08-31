# 109 - Drills: report requests, set 1

Eight requests, written the way they actually arrive - a sentence from a
manager, not a spec. Translating prose into an exact query is the drilled
skill; the machinery is lessons 06-08, 12, 16-18 and 20. The output contract
under each quote is exact, because the gate compares literal rows.

## Exercise 1 - the Monday number

> "Quick one before the exec call: October, paid orders only - how many
> orders, how much revenue, and what was the average order worth?"

One row, three columns: `orders`, `revenue` = `sum(total)`, `aov` =
`round(avg(total), 2)`. October 2023, `status = 'paid'`, half-open dates.

Edit `ex1/solution.sql`. Run: `uv run dojo test 109_drills_reports_1 ex1`

## Exercise 2 - the same month, split by week

> "Nice. Now split October by week so I can see the shape."

Columns `week` (`date_trunc('week', created_at)`), `orders`, `revenue` =
`sum(total)`; paid October orders as in ex1. **Ordered by `week`
ascending.** (6 rows - PostgreSQL weeks start Monday, so the first and last
rows are partial weeks.)

Edit `ex2/solution.sql`. Run: `uv run dojo test 109_drills_reports_1 ex2`

## Exercise 3 - who is paying the bills this quarter

> "Top eight countries by real revenue since the quarter started, with the
> order counts. Real - leave the cancellations out."

Orders created on or after `2023-10-01`, `status <> 'cancelled'`, joined to
`customers` for `country`. Columns `country`, `orders`, `revenue` =
`sum(total)`. **Ordered by `revenue` descending, then `country` ascending,
limited to 8 rows.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 109_drills_reports_1 ex3`

## Exercise 4 - are cancellations eating us?

> "For each month this year: how many orders, how many got cancelled, and
> the cancellation rate. I want to see if it is drifting."

2023 orders. Columns `month` (`date_trunc('month', created_at)`), `orders`,
`cancelled`, `cancel_pct` = `round(100.0 * cancelled / orders, 1)`.
**Ordered by `month` ascending.** (11 rows - the data ends mid-November.)

Edit `ex4/solution.sql`. Run: `uv run dojo test 109_drills_reports_1 ex4`

## Exercise 5 - how fast do signups start buying?

> "Of the people who did buy something: how long after signing up did their
> first order come, on average? By signup year, please."

For every customer with at least one order: their wait =
`min(order created_at)::date - signup created_at::date` in days. Columns
`signup_year` (`extract(year FROM customers.created_at)::int`), `buyers`,
`avg_days` = the average wait rounded to 1 decimal. **Ordered by
`signup_year` ascending.** (3 rows: 2021-2023.)

Edit `ex5/solution.sql`. Run: `uv run dojo test 109_drills_reports_1 ex5`

## Exercise 6 - weekends versus weekdays, by category

> "Marketing swears weekends behave differently. Line-item revenue per
> category, weekday money and weekend money side by side - skip cancelled
> orders."

Over `order_items` joined to `orders` and `products`, `status <>
'cancelled'`: columns `category`, `weekday_rev`, `weekend_rev` - each a
`sum(quantity * price)` filtered by `extract(isodow FROM o.created_at)`
(`>= 6` is the weekend). **Ordered by `category` ascending.** (6 rows.)

Edit `ex6/solution.sql`. Run: `uv run dojo test 109_drills_reports_1 ex6`

## Exercise 7 - the growth column

> "Paid orders per month for 2023, with the percent change on the previous
> month, and just tell me up or down - I read arrows faster than numbers."

Columns `month`, `orders` (paid, 2023), `change_pct` = `round(100.0 *
(orders - prev) / prev, 1)` where `prev` is the previous month's count, and
`trend` = `'up'` / `'down'` / `'flat'` comparing `orders` to `prev`.
January has no previous month: its `change_pct` and `trend` are NULL.
**Ordered by `month` ascending.** (11 rows.)

Edit `ex7/solution.sql`. Run: `uv run dojo test 109_drills_reports_1 ex7`

## Exercise 8 - the whales that stopped calling

> "Our biggest customers who have gone quiet: top ten by lifetime real
> revenue among the ones with no order since September. Names on them,
> and when we last saw them."

Non-cancelled orders only, in both the revenue and the "last seen" sense: a
customer qualifies when their **latest non-cancelled order** is before
`2023-09-01`. Columns `customer_id`, `name`, `revenue` = `sum(total)`,
`last_order_at` = `max(created_at)`. **Ordered by `revenue` descending,
then `customer_id` ascending, limited to 10 rows.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 109_drills_reports_1 ex8`

## The gate

```python
"""Gates for 109_drills_reports_1. Quoted verbatim in README.md."""
from dojo import grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(shared_lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


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
compares rows. Exercise 1 returns one row and is graded unordered; the rest
name an ordering and are graded with `ordered=True`.

Next: **110_drills_reports_2** - cohorts, funnels, and the activity stream.
