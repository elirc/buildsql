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
