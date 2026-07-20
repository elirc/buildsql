# 15 — Window functions I: numbering and ranking

GROUP BY answers "one row per group". But half of real reporting wants
**every row kept, with group context attached**: each product *and* its
category's average; each order *and* its rank among that customer's
orders. Collapsing loses the rows; correlated subqueries (lesson 13) keep
them but re-run per row and read like riddles. Window functions are the
purpose-built tool: per-row results computed *over a window* of related
rows.

## Concept

```sql
SELECT name, salary,
       row_number() OVER (ORDER BY salary DESC, id) AS rn,
       rank()       OVER (ORDER BY salary DESC)     AS rnk,
       dense_rank() OVER (ORDER BY salary DESC)     AS drnk
FROM staff;
```

- `OVER (...)` marks a window function. Empty `OVER ()` means "the window
  is the whole result".
- `PARTITION BY x` splits the window into per-group sub-windows — GROUP
  BY's sibling that *doesn't collapse rows*:

```sql
avg(price) OVER (PARTITION BY category)   -- each row sees its category avg
```

- The numbering trio: `row_number()` — unique 1,2,3 (needs a tie-break in
  its ORDER BY to be deterministic!); `rank()` — ties share a number,
  then gaps (1,1,3); `dense_rank()` — ties share, no gaps (1,1,2).
- **Windows are evaluated after WHERE** — so you can't filter on one
  directly. The idiom: compute in a CTE (hello, lesson 14), filter
  outside:

```sql
WITH ranked AS (SELECT ..., row_number() OVER (...) AS rn FROM ...)
SELECT ... FROM ranked WHERE rn <= 5;
```

That idiom is *the* top-N-per-group solution — the thing lesson 03's
challenge made you sweat for.

## Exercise 1 — the salary leaderboard

Edit `ex1/solution.sql`. All 500 staff: `name`, `salary`, and `rn` =
their company-wide salary position (1 = highest paid; equal salaries
broken by `id` ascending). **Ordered by `rn`.**

Run: `uv run dojo test 15_window_functions_1 ex1`

## Exercise 2 — each product against its category

Edit `ex2/solution.sql`. Every product: `id`, `name`, `price`, and
`category_avg` — the average price of its category, rounded to 2
decimals. Any order. One window function, no join, no GROUP BY: that's
the point.

Run: `uv run dojo test 15_window_functions_1 ex2`

## Exercise 3 — top-5 per category, the right way

Edit `ex3/solution.sql`. Lesson 03's challenge, revisited on your terms:
the 5 most expensive products per category. Columns: `category`, `name`,
`price`. **Ordered by `category` ASC, then `price` DESC, then `id` ASC.**
Use `row_number()` partitioned by category (ordered by price DESC, id) in
a CTE, filter `rn <= 5` outside. Feel how much better this is.

Run: `uv run dojo test 15_window_functions_1 ex3`

## Challenge — departmental podium (optional)

Edit `challenge/solution.sql`. The top 3 salaries **per department** —
but using `rank()`, so that if two people tie for 3rd, both appear.
Columns: `department`, `name`, `salary`. Any order.

Run: `uv run dojo test 15_window_functions_1 challenge`

## Spaced review

`review1/`: "page 2" of the product catalog priced high-to-low: rows 11
through 20 by (`price` DESC, `id` ASC). Columns: `id`, `name`, `price`,
**ordered** the same way. Do it with `row_number()` in a CTE — same rows
OFFSET would give, but the pattern extends to per-group pagination, which
OFFSET can't do.

## The gate

```python
"""Gates for 15_window_functions_1. Quoted verbatim in README.md."""
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
    grader.assert_rows_equal(actual, expected)


def test_ex3(shared_lesson_db):
    ex = L.exercise("ex3")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


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
    grader.assert_rows_equal(actual, expected, ordered=True)
```

## The teaching point

Interviewers use top-N-per-group as a litmus test because it cleanly
separates SQL generations: the OFFSET-and-loop crowd, the correlated
subquery crowd, and the window crowd. Production dashboards are built on
the ranked-CTE idiom — "latest event per device", "best offer per
product", "first touch per campaign" are all the same three lines. Master
the idiom, not the example.

Next: **16_window_functions_2** — frames, running totals, LAG/LEAD.
