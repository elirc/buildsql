# 16 — Window functions II: frames, LAG, running totals

Lesson 15's windows looked at *whole* partitions. Add `ORDER BY` inside
the OVER and the window gains a direction — and suddenly you can express
"so far" (running totals), "compared to yesterday" (LAG), and "average of
the last 7 rows" (frames). This is the grammar of every time-series
report you will ever build.

## Concept

```sql
sum(revenue) OVER (ORDER BY day)                       -- running total
lag(revenue)  OVER (ORDER BY month)                    -- previous row's value
lead(revenue) OVER (ORDER BY month)                    -- next row's value
avg(revenue) OVER (ORDER BY day
                   ROWS BETWEEN 6 PRECEDING
                        AND CURRENT ROW)               -- 7-row moving average
ntile(4)     OVER (ORDER BY salary DESC)               -- quartile buckets
```

- With ORDER BY inside OVER, an aggregate's **frame** defaults to "start
  of partition through current row" — which is precisely a running total.
- `ROWS BETWEEN ... AND ...` sets the frame explicitly. `ROWS` counts
  physical rows; there's also `RANGE` (peers by value) — subtly different
  with ties; when in doubt, say ROWS and mean it.
- `lag(col)` / `lead(col)` return NULL at the edges — remember lesson 05:
  arithmetic with that NULL yields NULL, which is usually the *correct*
  display for "no previous month".
- `ntile(n)` deals rows into n near-equal buckets in frame order.

These all compose with lesson 14's CTEs: aggregate first (per day, per
month), *then* window over the small result. Windowing 3 million raw rows
when 31 daily rows suffice is a real production performance smell.

All of this lesson's exercises work on **October 2023** daily revenue or
the monthly series — small, checkable numbers.

## Exercise 1 — running total

Edit `ex1/solution.sql`. Daily revenue for October 2023 with a running
month-to-date column. CTE: one row per day (`date_trunc('day',
created_at)`), revenue = sum of totals, for `created_at >= '2023-10-01'
AND < '2023-11-01'`. Main: `day`, `revenue`, `running` = running sum in
day order. **Ordered by `day`.** (31 rows.)

Run: `uv run dojo test 16_window_functions_2 ex1`

## Exercise 2 — month-over-month with LAG

Edit `ex2/solution.sql`. The 13-month revenue series (all orders, grouped
by `date_trunc('month', created_at)`), each month with the previous
month's revenue beside it and the difference. Columns: `month`,
`revenue`, `prev` (LAG, NULL for the first month), `delta` (revenue −
prev, NULL for the first month). **Ordered by `month`.**

Run: `uv run dojo test 16_window_functions_2 ex2`

## Exercise 3 — 7-day moving average

Edit `ex3/solution.sql`. October 2023 daily revenue again, now with
`ma7` — the average of the current day and the 6 preceding days, rounded
to 2 decimals (early days average over however many rows exist).
Columns: `day`, `revenue`, `ma7`. **Ordered by `day`.**

Run: `uv run dojo test 16_window_functions_2 ex3`

## Exercise 4 — a running total per partition

Edit `ex4/solution.sql`. October 2023 again, now split by status. In a
CTE, produce one row per (`day`, `status`) with that day's revenue for
that status. Then add **`running`** — the month-to-date total *within each
status*.

Columns, in this order: `day`, `status`, `revenue`, `running`. **Ordered by
`status` ascending, then `day` ascending.** (31 days x 4 statuses = 124
rows.)

One phrase in the `OVER` clause does all the work: `PARTITION BY status
ORDER BY day`. The partition restarts the accumulation for each status, so
November's `cancelled` running total never inherits `paid`'s. Getting a
running total to reset per group is a question that comes up constantly and
has exactly this one-word answer.

Run: `uv run dojo test 16_window_functions_2 ex4`

## Exercise 5 — looking forward with LEAD

Edit `ex5/solution.sql`. The 13-month revenue series (all orders, grouped
by `date_trunc('month', created_at)`), each month with the **next**
month's revenue beside it.

Columns, in this order: `month`, `revenue`, `next_month` (NULL for the
final month). **Ordered by `month` ascending.**

`lead()` is `lag()` pointing the other way, and the NULL lands at the *end*
of the series instead of the beginning. Both take an optional offset —
`lag(revenue, 12)` is the year-ago comparison every finance report wants —
and an optional default: `lag(revenue, 1, 0)` substitutes zero instead of
NULL at the edge, which is occasionally right and usually a lie.

Run: `uv run dojo test 16_window_functions_2 ex5`

## Exercise 6 — the best day so far

Edit `ex6/solution.sql`. October 2023 daily revenue one last time, with
**`best_so_far`** — the highest single-day revenue seen up to and including
that day.

Columns, in this order: `day`, `revenue`, `best_so_far`. **Ordered by
`day` ascending.** (31 rows.)

`sum()` over an ordered window gives a running total; `max()` over the same
window gives a running maximum. Every aggregate you know works this way —
`min`, `avg`, `count`, `bool_or` — and the default frame ("from the start
of the partition to the current row") is what makes them all cumulative.
Once that clicks, "highest water mark to date", "worst drawdown so far" and
"has this ever happened yet" all stop being special cases.

Run: `uv run dojo test 16_window_functions_2 ex6`

## Challenge — growth percentage, one query (optional)

Edit `challenge/solution.sql`. The classic board-deck column: monthly
revenue with **growth_pct** = 100 × (revenue − previous) / previous,
rounded to 1 decimal, NULL for the first month. Columns: `month`,
`revenue`, `growth_pct`. **Ordered by `month`.** One LAG can feed two
expressions — or window once in a CTE and compute outside.

Run: `uv run dojo test 16_window_functions_2 challenge`

## Spaced review

`review1/`: salary quartiles: every staff member with `quartile` =
`ntile(4)` over (`salary` DESC, `id`). Columns: `name`, `salary`,
`quartile`. **Ordered by `salary` DESC, `id`.**

## The gate

```python
"""Gates for 16_window_functions_2. Quoted verbatim in README.md."""
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
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex6(shared_lesson_db):
    ex = L.exercise("ex6")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


@pytest.mark.challenge
def test_challenge(shared_lesson_db):
    ex = L.exercise("challenge")
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

Before window functions (SQL:2003, but adopted slowly), running totals
were done with self-joins (`t2.day <= t1.day` — quadratic!) or in
application code, where pagination breaks them. When you see a loop in
Python accumulating a total over query results, that's often a window
function that escaped. Push it down: the database sorts once, scans once,
and the number arrives correct on every page.

Next: **17_conditional_pivots** — turning rows into columns.
