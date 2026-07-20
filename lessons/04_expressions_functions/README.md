# 04 — Expressions and functions

You already computed one column (`price * 1.2` in lesson 01). This lesson
makes that a habit: arithmetic, text functions, `COALESCE` for filling
NULLs, and `CASE` — SQL's per-row if/else. These appear in virtually every
production query; reports are mostly *expressions over columns*, not raw
columns.

## Concept

Per-row functions you'll use constantly:

```sql
SELECT
  round(price * 1.2, 2)              AS with_tax,      -- 2 decimal places
  round(salary, -3)                  AS to_thousands,  -- negative = left of the point
  upper(name)                        AS shouting,
  left(name, 8)                      AS clipped,
  name || ' (' || category || ')'    AS label,         -- || concatenates text
  concat(name, ' / ', category)      AS label2,        -- concat() too
  coalesce(manager_id, 0)            AS mgr_or_zero,   -- first non-NULL argument
  substring(email FROM 1 FOR 6)      AS prefix
FROM ...;
```

And the workhorse, `CASE`:

```sql
CASE
  WHEN price < 50  THEN 'budget'
  WHEN price < 200 THEN 'mid'
  ELSE 'premium'
END AS tier
```

`CASE` evaluates top-to-bottom and stops at the first true `WHEN` — so the
second branch already knows `price >= 50`. Without an `ELSE`, non-matching
rows get NULL.

One trap worth meeting early: `||` with a number needs a cast, because
PostgreSQL won't guess. `'x' || 5` fails; `'x' || 5::text` works. `::type`
is the cast syntax you'll see everywhere.

## Exercise 1 — price tiers with CASE

Edit `ex1/solution.sql`. Merchandising tiers every product: `'budget'`
under 50, `'mid'` from 50 up to but not including 200, `'premium'` at 200
and above. Columns, in order: `id`, `name`, `price`, and the tier aliased
`tier`. All 10,000 rows, any order.

Run: `uv run dojo test 04_expressions_functions ex1`

## Exercise 2 — building display text

Edit `ex2/solution.sql`. The HR directory wants, for every staff member:

1. `badge` — the name, then the department in parentheses:
   `Priya Patel (engineering)`
2. `salary_band` — the salary rounded to the nearest **thousand** (use
   `round` with a negative second argument).

Two columns, all 500 rows, any order.

Run: `uv run dojo test 04_expressions_functions ex2`

## Challenge — a nested label (optional)

Edit `challenge/solution.sql`. The mobile app shows compact product cards:
one column, `card`, for every product, formatted as the first 12 characters
of the upper-cased name, then `' — $'`, then the price. Example:

```
AERO WIDGET  — $137.53
```

Exactly: `left(upper(name), 12) || ' — $' || price`. The catch: `price` is
numeric, and `||` needs text — you'll have to cast. Any row order.

Run: `uv run dojo test 04_expressions_functions challenge`

## Spaced review

`review1/`: every product's `name` and a `sale_price` — the price with 10%
off, rounded to 2 decimals. Two columns, any order.

## The gate

```python
"""Gates for 04_expressions_functions. Quoted verbatim in README.md."""
import pytest

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
    grader.assert_rows_equal(actual, expected)


@pytest.mark.challenge
def test_challenge(shared_lesson_db):
    ex = L.exercise("challenge")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


@pytest.mark.review
def test_review1(shared_lesson_db):
    ex = L.exercise("review1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
```

## The teaching point

Expressions belong in SQL more often than in application code: computing a
tier or a label in the query means every consumer — the report, the export,
the dashboard — agrees on the definition, and the database can sometimes use
an index on the expression (lesson 40). When you find application code
re-implementing the same CASE ladder in three services, the fix is usually
"push it into the query" (or a view — lesson 27).

Next: **05_null_logic** — the three-valued logic that breaks everyone once.
