# 20 — Querying capstone: the analytics sprint

Part 2's graduation project. Three asks from a product analytics sprint —
each one stacks CTEs, joins, windows, and date work. As in lesson 12, the
prompts are written as the requests actually arrive; the translation is
yours. Expect each of these to take several attempts. That's the design.

## Exercise 1 — daily active customers

> *"Standard DAU chart for the last week of data, please — how many
> distinct customers did anything on the site each day."*

Edit `ex1/solution.sql`. From `events`: one row per day from
**2023-11-08 through 2023-11-14** (the last full week), columns `day`
(date) and `dau` (distinct `customer_id` count). **Ordered by `day`.**
(7 rows — every day has traffic, no series needed.)

Run: `uv run dojo test 20_querying_capstone ex1`

## Exercise 2 — signup cohorts that actually buy

> *"For each monthly signup cohort of 2023: how many customers signed up,
> and how many of them have ever placed an order. I want conversion at a
> glance."*

Edit `ex2/solution.sql`. Cohort = `date_trunc('month', customers.
created_at)`, restricted to 2023 signups (Jan 1 through Nov 14 — the
seed's end of time; 11 cohorts). Columns: `cohort`, `signups`, `buyers`
(customers of the cohort with ≥1 order — count them via EXISTS or a
LEFT-JOIN-DISTINCT, your call). **Ordered by `cohort`.**

Run: `uv run dojo test 20_querying_capstone ex2`

## Exercise 3 — top movers, September to October

> *"Which categories are heating up? Line-item revenue September vs
> October 2023, and the percent change, best movers first."*

Edit `ex3/solution.sql`. For each product `category`: `sep_rev` (line
item revenue in Sep 2023), `oct_rev` (Oct 2023), `pct` = 100 × (oct −
sep) / sep **rounded to 1 decimal**. Filter by the *order's*
`created_at`; revenue = `quantity * price` from items, all order
statuses. **Ordered by `pct` descending, then `category`.** (6 rows.
FILTER makes the two-month pivot painless.)

Run: `uv run dojo test 20_querying_capstone ex3`

## Exercise 4 — "What does a week of traffic look like?"

> *"Break the last week down by event type — volume and reach. How many
> events of each kind, and how many different people did each one."*

Edit `ex4/solution.sql`. From `events`, for `ts` in **2023-11-08 through
2023-11-14** (half-open: `>= '2023-11-08' AND < '2023-11-15'`), one row per
`event_type`.

Columns, in this order: `event_type`, `events` (count), `customers`
(distinct `customer_id`). **Ordered by `events` descending, then
`event_type` ascending.** (5 rows.)

"Volume and reach" is the whole ask, and the two numbers come apart:
`count(*)` and `count(DISTINCT customer_id)` measure different things, and a
funnel built on the wrong one exaggerates every step where people repeat
themselves.

Run: `uv run dojo test 20_querying_capstone ex4`

## Exercise 5 — "Who are our loyal customers?"

> *"One number I keep asking for and never getting: what share of our
> buyers are genuinely loyal — say, fifteen orders or more?"*

Edit `ex5/solution.sql`. Considering only customers who have placed at
least one order, produce **one row** with three columns:

1. `buyers` — how many customers have ever ordered
2. `loyal` — how many of those have **fifteen or more** orders
3. `loyal_pct` — `loyal` as a percentage of `buyers`, rounded to 1 decimal

Aggregate per customer in a CTE or derived table first, then aggregate
*that*. Aggregating an aggregate is the step people get stuck on, and it is
just a second `SELECT` around the first.

Note the population the request implies: customers who have never ordered
are excluded from both the numerator and the denominator. That is almost
certainly what was meant — but "what share of our *customers* are loyal" is
a different and equally reasonable question, and its answer is smaller by
the 5,003 people who have never bought anything.

Note the threshold too. "Fifteen or more" was the requester's number, not a
fact about the business — try 2, 10 and 20 in the lab and watch the
headline swing from 100% to under 2%. A metric with a hand-picked cutoff in
it is an argument, not a measurement.

Run: `uv run dojo test 20_querying_capstone ex5`

## Exercise 6 — "Are baskets getting bigger?"

> *"Average number of line items per order, by month, for this year. If
> that number is moving I want to know about it."*

Edit `ex6/solution.sql`. For orders created in **2023** (half-open, Jan 1
to Jan 1), compute the average number of `order_items` rows per order, per
calendar month.

Columns, in this order: `month` (`date_trunc('month', o.created_at)`),
`avg_items` (average line count per order, rounded to **3** decimals).
**Ordered by `month` ascending.** (11 rows.)

The shape is two-stage and the stages must not be collapsed: count items
*per order* first, then average those counts *per month*. Try to do it in
one step — `count(*) / count(DISTINCT o.id)` over the joined rows — and you
get a number that is right only when every order has the same number of
lines. Averaging an average is one of the most common quietly-wrong things
in analytics.

Run: `uv run dojo test 20_querying_capstone ex6`

## Spaced review

`review1/`: purchases per day for the same last week (2023-11-08 through
2023-11-14): `day`, `purchases` (count of `'purchase'` events),
**ordered by day**.

## The gate

```python
"""Gates for 20_querying_capstone. Quoted verbatim in README.md."""
import pytest

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
    grader.assert_rows_equal(actual, expected)


def test_ex6(shared_lesson_db):
    ex = L.exercise("ex6")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


@pytest.mark.review
def test_review1(shared_lesson_db):
    ex = L.exercise("review1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)
```

## The teaching point

Notice how each ask decomposed: *define the population, define the time
grain, define the measure* — then the SQL wrote itself from parts you
drilled in lessons 13–19. That decomposition survives any tool change;
seniors interview for it. You're done with pure querying — **Part 3**
teaches you to *change* data without fear.

Next: **21_insert_update_delete**.
