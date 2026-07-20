# 18 — Dates and times

Every table in this database carries a timestamp, and you've already
leaned on `date_trunc` twice without a proper introduction. Time to pay
the debt: truncation, extraction, interval arithmetic, and the
series-generation trick that finds what *didn't* happen.

## Concept

```sql
date_trunc('month', created_at)        -- 2023-07-19 14:02 -> 2023-07-01 00:00
extract(year  FROM created_at)         -- 2023 (numeric)
extract(dow   FROM created_at)         -- day of week, 0 = Sunday .. 6 = Saturday
extract(hour  FROM ts)                 -- 0..23
created_at + interval '7 days'         -- timestamp arithmetic
now() - interval '90 days'             -- (we never use now() in gates — determinism)
```

- **`date_trunc` groups; `extract` classifies.** Truncating to month keeps
  months of different years apart (2022-11 ≠ 2023-11); extracting month
  folds all Novembers together. Choosing wrong flips a report's meaning.
- Half-open ranges, always: `>= start AND < end` (you adopted this in
  lesson 12; it's doubly important with timestamps, where `BETWEEN`'s
  inclusive end bites at midnight).
- **`generate_series`** manufactures rows that don't exist in any table:

```sql
SELECT gs::date AS day
FROM generate_series('2023-10-15'::date, '2023-11-13'::date,
                     interval '1 day') AS gs;
```

  Joined (LEFT, lesson 09!) against real data, a series exposes the
  *holes* — days with no sales, hours with no events. Databases only
  store what happened; the series represents what could have.

One honest paragraph on types: `timestamptz` (our columns) stores an
instant in UTC and renders it in your session's time zone; `timestamp`
stores wall-clock digits with no zone attached. Cross-zone arithmetic
and DST make `timestamp` a foot-gun for instants — the rule in modern
PostgreSQL shops is **timestamptz unless you can argue otherwise** (a
birthday is a `date`; "9am local, every site" is a `time` + zone name).
Part 4 revisits this when you design schemas.

## Exercise 1 — orders by weekday

Edit `ex1/solution.sql`. Do we sell more on weekends? One row per day of
week: `dow` (0–6, integer — cast the extract: `extract(...)::int`),
`orders` (count). **Ordered by `dow`.** (7 rows.)

Run: `uv run dojo test 18_dates_times ex1`

## Exercise 2 — the days customer 4242 went quiet

Edit `ex2/solution.sql`. The clickstream (`events`) spans about a month.
Customer 4242 shows up on most days — but not all. Return every date from
**2023-10-15 through 2023-11-13 inclusive** on which customer 4242
produced **zero events**. One column `day` (a `date`), **ordered
ascending**. Build the calendar with `generate_series`, LEFT JOIN the
customer's event days against it, keep the NULLs (lesson 09's anti-join,
third appearance).

Run: `uv run dojo test 18_dates_times ex2`

## Challenge — peak purchase hours (optional)

Edit `challenge/solution.sql`. The 3 hours of the day (0–23) with the
most `'purchase'` events. Columns: `hour` (int), `purchases`. Ordered by
`purchases` descending, then `hour` ascending, 3 rows.

Run: `uv run dojo test 18_dates_times challenge`

## Spaced review

`review1/`: orders per **first-week-of-signup**: how many orders were
placed within 7 days of the customer's own signup? One number — but
computed with the half-open interval pattern: `o.created_at >=
c.created_at AND o.created_at < c.created_at + interval '7 days'`.
Columns: just `first_week_orders`. (One row. If you get ~130,000 instead
of ~4,900, you forgot the lower bound — orders *before* signup snuck in.
Think about why that matters.)

## The gate

```python
"""Gates for 18_dates_times. Quoted verbatim in README.md."""
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
    grader.assert_rows_equal(actual, expected)
```

## The teaching point

The gap-days pattern (calendar series LEFT JOIN facts) is how real
monitoring queries are written: "which shops reported no sales
yesterday", "which sensors sent nothing this hour". The naive approach —
querying for what happened and eyeballing what's missing — cannot be
automated. Manufacture the expectation, join reality against it, alert on
the NULLs.

Next: **19_text_jsonb** — strings and the document column.
