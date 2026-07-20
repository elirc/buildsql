# 02 — WHERE: filtering rows

`orders` has 500,000 rows. Every query you wrote in lesson 01 returned *all*
the rows of its table, because you had no way to say which ones you wanted.
`WHERE` is that way. It sits after `FROM`, holds a condition, and keeps only
the rows for which the condition is true.

## Concept

```sql
SELECT id, total
FROM orders
WHERE total > 1900;
```

Conditions compose. The operators you need this lesson:

- Comparisons: `=`, `<>` (not equal), `<`, `<=`, `>`, `>=`
- Combining: `AND`, `OR`, `NOT` — **and `AND` binds tighter than `OR`**.
  `a OR b AND c` means `a OR (b AND c)`. When mixing them, always write the
  parentheses you mean. This is the single most common WHERE bug in the
  wild.
- `IN (v1, v2, ...)` — equal to any of the listed values.
- `BETWEEN x AND y` — inclusive on both ends.
- `LIKE` / `ILIKE` — pattern matching; `%` matches any run of characters,
  `_` exactly one. `ILIKE` ignores case; `LIKE` doesn't.

Try in `dojo lab 02_where_filtering`:

```sql
SELECT count(*) FROM orders WHERE status = 'paid' AND total BETWEEN 100 AND 110;
SELECT count(*) FROM customers WHERE name ILIKE 'mar%';
```

## Exercise 1 — a simple comparison

Edit `ex1/solution.sql`. The finance team wants the big-ticket orders:
**every order with `total` greater than 1900**. Return three columns in this
order: `id`, `customer_id`, `total`. Row order doesn't matter.

Run: `uv run dojo test 02_where_filtering ex1`

## Exercise 2 — AND, OR, and the parentheses you mean

Edit `ex2/solution.sql`. Fraud review wants **paid orders with an extreme
total**: status is `'paid'`, and the total is *either* under 20 *or* over
1980. Return `id`, `status`, `total`. Row order doesn't matter.

Write it with explicit parentheses. If you get twice as many rows as you
expected, you've just met the precedence bug from the concept section —
that's the lesson working as intended.

Run: `uv run dojo test 02_where_filtering ex2`

## Exercise 3 — pattern matching

Edit `ex3/solution.sql`. Return every customer whose **name contains the
letters `son`, matched case-insensitively** (Anderson, Sonia, Jackson...).
Columns: `id`, `name`. Row order doesn't matter.

Run: `uv run dojo test 02_where_filtering ex3`

## Challenge — fix the precedence bug (optional)

A colleague wrote this query, meaning to get *pending or paid* orders over
1000, and swears SQL is broken because cheap pending orders keep appearing:

```sql
SELECT id, status, total
FROM orders
WHERE status = 'pending' OR status = 'paid' AND total > 1000;
```

Edit `challenge/solution.sql` with the **fixed** query: orders whose status
is `'pending'` or `'paid'`, **and** whose total exceeds 1000. Same three
columns. Row order doesn't matter. (Two fixes work: parentheses, or `IN`.)

Run: `uv run dojo test 02_where_filtering challenge`

## Spaced review

`review1/`: all products in category `'toys'` priced **between 10 and 20
inclusive** — columns `id`, `name`, `price`, any row order.

## The gate

```python
"""Gates for 02_where_filtering. Quoted verbatim in README.md."""
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


def test_ex3(shared_lesson_db):
    ex = L.exercise("ex3")
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

Each test compares your rows to the reference rows as an unordered multiset.

## The teaching point

Production incident reports are full of WHERE clauses that were *almost*
right: an `OR` without parentheses, a `BETWEEN` that was accidentally
inclusive, a `LIKE` that should have been `ILIKE`. The database always does
exactly what you wrote — the discipline is making what you wrote exactly
what you meant. Parenthesize every mixed AND/OR, every time.

Next: **03_order_limit** — putting rows in order and taking the top N.
