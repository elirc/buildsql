# 12 — Fundamentals capstone: the quarterly review

No new SQL in this lesson. Instead: three requests written the way they
actually arrive — as stakeholder asks, not query specs. Your job includes
the *translation*: choosing the joins, the grouping, the filters, the
ordering. That translation is the actual job; the SQL is the easy part by
now.

The company's fiscal quarter in question is **Q3 2023: July 1 through
September 30, 2023** (i.e. `created_at >= '2023-07-01' AND created_at <
'2023-10-01'` — half-open ranges avoid the "was September 30 23:59:59
included?" argument forever; make them a habit).

## Exercise 1 — "How did Q3 go, by status?"

> *From: CFO. "One table: for each order status in Q3, how many orders and
> how much money. Alphabetical by status so I can find things."*

Edit `ex1/solution.sql`. Columns in order: `status`, `orders` (count),
`revenue` (sum of `total`). Filter to Q3 2023 as defined above. **Ordered
by status ascending.**

Run: `uv run dojo test 12_fundamentals_capstone ex1`

## Exercise 2 — "Who are our whales?"

> *From: VP Sales. "Top ten customers by lifetime real revenue — count
> paid and shipped orders only, cancelled and pending are vapor. Names,
> please, and their totals."*

Edit `ex2/solution.sql`. Columns in order: `id` (customer), `name`,
`spend` (sum of qualifying order totals). Sort by `spend` descending,
tie-break `id` ascending, 10 rows.

Run: `uv run dojo test 12_fundamentals_capstone ex2`

## Exercise 3 — "What actually sells?"

> *From: Merchandising. "Category league table, real revenue only —
> paid or shipped orders. For each category: how many units moved and the
> line-item revenue. Don't care about the order of rows."*

Edit `ex3/solution.sql`. Columns in order: `category`, `units` (sum of
quantities), `revenue` (sum of `quantity * price` from the line items).
Filter orders to status paid or shipped. Any row order. (Three tables:
`orders`, `order_items`, `products`.)

Run: `uv run dojo test 12_fundamentals_capstone ex3`

## Spaced review

`review1/`: revenue per customer country for **paid** orders in Q3 2023 —
columns `country`, `revenue`, any order. (Joins `customers` to `orders`;
12 rows.)

## The gate

```python
"""Gates for 12_fundamentals_capstone. Quoted verbatim in README.md."""
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
    grader.assert_rows_equal(actual, expected)


@pytest.mark.review
def test_review1(shared_lesson_db):
    ex = L.exercise("review1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
```

## The teaching point

Notice what the three asks had in common: none of them named a table, a
join, or a function — and all of them contained a *revenue definition
decision* ("real revenue", "vapor") that the stakeholder considered
obvious. Getting that definition wrong produces a beautiful, fast,
confidently wrong report. The best question a data person asks is "what
exactly counts?" — before writing a line.

**Part 1 complete.** Next: **13_subqueries** opens Part 2 — queries
inside queries.
