# 110 - Drills: report requests, set 2

Eight more requests in stakeholder prose - this set leans on cohorts, the
activity stream, and two-stage aggregation (lessons 06-07, 12, 17-18, 20).
The quote sets the intent; the contract below it is what the gate grades.

## Exercise 1 - the shape of an order, by status

> "What does a typical order look like in each status? Count and average
> value, all four statuses, cancelled included - I want the comparison."

Columns `status`, `orders`, `avg_total` = `round(avg(total), 2)`.
**Ordered by `status` ascending.** (4 rows.)

Edit `ex1/solution.sql`. Run: `uv run dojo test 110_drills_reports_2 ex1`

## Exercise 2 - the signup curve

> "How has signup volume moved since we opened? Quarterly is the right
> grain."

Columns `quarter` (`date_trunc('quarter', created_at)` over `customers`),
`signups`. **Ordered by `quarter` ascending.** (9 rows; the first and last
quarters are partial.)

Edit `ex2/solution.sql`. Run: `uv run dojo test 110_drills_reports_2 ex2`

## Exercise 3 - the hall of shame

> "Which ten products do reviewers hate most? Only count products with a
> real sample - a hundred reviews or more."

Per product: `id`, `name`, `reviews` = review count, `avg_rating` =
`round(avg(rating), 2)`, keeping products with at least 100 reviews.
**Ordered by the unrounded average rating ascending, then `id` ascending,
limited to 10 rows.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 110_drills_reports_2 ex3`

## Exercise 4 - the last three days, by type

> "Break the end of the stream down for me: the last three full-ish days,
> events per day, split by type."

Anchor on the stream itself: `last_day = date_trunc('day', max(ts))`; the
window is `ts >= last_day - interval '2 days'` and `ts < last_day +
interval '1 day'`. Columns `day` (`date_trunc('day', ts)`), then FILTER
counts `views`, `clicks`, `carts`, `purchases`, `logouts`. **Ordered by
`day` ascending.** (3 rows.)

Edit `ex4/solution.sql`. Run: `uv run dojo test 110_drills_reports_2 ex4`

## Exercise 5 - do new signups convert fast?

> "For each signup month this year: how many people signed up, and how many
> ordered within their first 30 days. Percentage too."

2023 signup cohorts (`date_trunc('month', customers.created_at)`). A fast
buyer has an order with `o.created_at < c.created_at + interval '30
days'`. Columns `cohort`, `signups`, `fast_buyers`, `fast_pct` =
`round(100.0 * fast_buyers / signups, 1)`. **Ordered by `cohort`
ascending.** (11 rows.)

Edit `ex5/solution.sql`. Run: `uv run dojo test 110_drills_reports_2 ex5`

## Exercise 6 - how much of the site do people touch?

> "Of the customers we see in the event stream: how many touch one kind of
> event, how many touch two, and so on up to all five?"

Stage one: distinct `event_type` count per `customer_id` over `events`.
Stage two: the distribution. Columns `types`, `customers`. **Ordered by
`types` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 110_drills_reports_2 ex6`

## Exercise 7 - casual buyers, or a habit?

> "Of this year's signups who bought anything: what share turned into
> genuinely heavy customers - say, a dozen orders or more? By signup
> quarter."

2023 signups with at least one order. Columns `cohort`
(`date_trunc('quarter', customers.created_at)`), `buyers`, `heavy`
(order count >= 12), `heavy_pct` = `round(100.0 * heavy / buyers, 1)`.
**Ordered by `cohort` ascending.** (4 rows.)

Edit `ex7/solution.sql`. Run: `uv run dojo test 110_drills_reports_2 ex7`

## Exercise 8 - two averages that are not the same number

> "Finance keeps mixing up average order value and revenue per customer.
> Put both on one monthly table for 2023 so the difference is visible."

Non-cancelled 2023 orders. Columns `month`, `orders`, `buyers` (distinct
customers), `aov` = `round(sum(total) / orders, 2)`, `arpu` =
`round(sum(total) / buyers, 2)`. **Ordered by `month` ascending.** (11
rows.)

Edit `ex8/solution.sql`. Run: `uv run dojo test 110_drills_reports_2 ex8`

## The gate

```python
"""Gates for 110_drills_reports_2. Quoted verbatim in README.md."""
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
compares rows; every prompt here names its ordering, so all eight use
`ordered=True`.

Next: **111_drills_reports_3** - the requests get harder to translate.
