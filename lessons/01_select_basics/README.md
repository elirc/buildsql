# 01 — SELECT basics

The `products` table holds 10,000 rows, and each row has six columns. Almost
no real question needs all six. "What do we sell and for how much?" needs
two. The first skill in SQL is not fetching data — it's fetching *only* the
data you asked about. That's what the SELECT list (the part between `SELECT`
and `FROM`) does.

## Concept

A query has a shape:

```sql
SELECT column_a, column_b    -- which columns, in which order
FROM some_table;             -- from which table
```

Three refinements this lesson adds:

- **Aliases** rename a column on the way out: `SELECT price AS usd FROM
  products` returns a column called `usd`. You can also compute new columns:
  `SELECT price * 2 AS double_price ...` — arithmetic on a column happens
  per-row.
- **DISTINCT** collapses duplicate rows *of the whole selected row*:
  `SELECT DISTINCT country FROM customers` gives each country once.
- **LIMIT n** truncates the result after n rows. Without an ORDER BY (lesson
  03) *which* n rows you get is not guaranteed — remember that.

Paste this in `dojo lab 01_select_basics` and play:

```sql
SELECT name AS product, price, price * 0.5 AS half_price
FROM products
LIMIT 5;
```

Column order in the output follows your SELECT list, left to right. The gate
checks it, because readers of your query results care about it.

## Exercise 1 — just two columns

Edit `ex1/solution.sql`. Return **every product's `name` and `price`** — two
columns, in that order, all 10,000 rows. Row order doesn't matter.

Run: `uv run dojo test 01_select_basics ex1`

## Exercise 2 — a computed, aliased column

Edit `ex2/solution.sql`. Finance wants a tax-inclusive price list: for every
product return three columns, in this order:

1. `name`
2. `price`
3. `price * 1.2`, aliased **`price_with_tax`**

Row order doesn't matter. (The gate compares values, not the alias name —
but write the alias anyway; queries are read by humans.)

Run: `uv run dojo test 01_select_basics ex2`

## Exercise 3 — DISTINCT

Edit `ex3/solution.sql`. Marketing asks: **which countries do our customers
come from?** Return one column, `country`, each country exactly once. Row
order doesn't matter.

Run: `uv run dojo test 01_select_basics ex3`

## Challenge — DISTINCT over a pair (optional, harder)

Edit `challenge/solution.sql`. Merchandising wants every distinct
**(category, color)** combination we sell. Category is a normal column, but
color lives *inside* the `attributes` JSONB column. You haven't met JSONB
yet (that's lesson 19) — here's the one operator you need: `attributes ->>
'color'` extracts the `color` field as text.

Return two columns: `category`, then the color (alias it `color`). Each
combination once. Row order doesn't matter.

Run: `uv run dojo test 01_select_basics challenge`

## Spaced review

`review1/` is a variant that `dojo review` will bring back days from now:
return each distinct order `status` from the `orders` table — one column,
each status once. Same skill, different table.

## The gate

```python
"""Gates for 01_select_basics. Quoted verbatim in README.md."""
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

Every test runs your `solution.sql` and the lesson's `expected.sql` against
the same clone and compares rows (as an unordered multiset — no ORDER BY
required this lesson).

## The teaching point

In production code review, `SELECT *` in application queries is a smell:
it couples the app to columns it never uses, breaks when someone adds a
column, and drags megabytes it doesn't need. Naming your columns — and your
computed expressions — is the habit. You'll write `SELECT` lists thousands
of times; make them deliberate from day one.

Next: **02_where_filtering** — keeping only the rows you want.
