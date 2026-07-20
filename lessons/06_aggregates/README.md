# 06 — Aggregates

Every query so far returned one row per table row. But most business
questions are about *many* rows at once: how many orders? what's the
average total? what's our worst rating? Aggregate functions collapse a
whole set of rows into a single value — and with `FILTER`, several
differently-scoped answers can share one pass over the table.

## Concept

```sql
SELECT count(*), sum(total), round(avg(total), 2), min(total), max(total)
FROM orders;
```

- `count(*)` counts **rows**. `count(some_column)` counts rows where that
  column is **not NULL** — on `staff`, `count(*)` is 500 but
  `count(manager_id)` is 499, because the CEO's is NULL (lesson 05 pays
  off already). This distinction is a classic interview question and a
  classic production bug.
- `sum`/`avg`/`min`/`max` also skip NULLs.
- `avg` on our `numeric` columns returns long decimals — `round(avg(x), 2)`
  keeps reports readable.
- `FILTER (WHERE ...)` scopes one aggregate without a second query:

```sql
SELECT count(*) FILTER (WHERE status = 'paid')      AS paid,
       count(*) FILTER (WHERE status = 'cancelled') AS cancelled
FROM orders;
```

One pass over 500,000 rows, two answers. (You may have seen the
`sum(CASE WHEN ... THEN 1 ELSE 0 END)` idiom — FILTER is the modern,
readable form; lesson 17 uses both.)

With no `GROUP BY` (next lesson), an aggregate query returns **exactly one
row**, even over an empty table (`count` gives 0, the others NULL).

## Exercise 1 — the orders dashboard row

Edit `ex1/solution.sql`. One row, five columns, in this order: the number
of orders, the smallest `total`, the largest `total`, the average `total`
rounded to 2 decimals, and the sum of all totals. From `orders`.

(Sanity anchor from `dataset_facts.md`: the average is 1004.58.)

Run: `uv run dojo test 06_aggregates ex1`

## Exercise 2 — status counts with FILTER

Edit `ex2/solution.sql`. One row, four columns, in this order: how many
orders are `paid`, `pending`, `shipped`, `cancelled`. Use one query with
four filtered counts — not four queries.

Run: `uv run dojo test 06_aggregates ex2`

## Challenge — the all-hands KPI row (optional)

Edit `challenge/solution.sql`. Leadership wants one row with four numbers
pulled from *different tables*: total customers, total orders, revenue
from `paid` orders (sum of their totals), and the average review rating
rounded to 2 decimals.

You can't FROM four tables at once for this — the trick is *scalar
subqueries*, each one a parenthesized single-value query in the SELECT
list (a preview of lesson 13):

```sql
SELECT (SELECT count(*) FROM customers) AS customers, ...
```

Run: `uv run dojo test 06_aggregates challenge`

## Spaced review

`review1/`: one row, two columns from `reviews`: the average `rating`
rounded to 2 decimals, and the total number of reviews.

## The gate

```python
"""Gates for 06_aggregates. Quoted verbatim in README.md."""
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

`count(*)` vs `count(col)` has caused real revenue misreports: counting
`shipped_at` instead of rows silently drops unshipped orders from an "all
orders" metric. When you review aggregate SQL, ask about every aggregate:
*what does this do with NULLs?* If you can't answer instantly, lesson 05
is the reread.

Next: **07_group_by_having** — one aggregate row *per group*.
