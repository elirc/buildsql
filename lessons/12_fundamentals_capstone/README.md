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

## Exercise 4 — "Did our Q3 signups convert?"

> *From: Growth. "We spent a lot acquiring people in Q3. How many of them
> never actually bought anything? Give me the list, I want to email them."*

Edit `ex4/solution.sql`. Customers whose **`created_at` falls in Q3 2023**
(same half-open range as above) and who have **never** placed an order at
all — not "no orders in Q3", none ever. Read that sentence twice; it is the
kind of distinction the requester did not realise they were making.

Columns: `id`, `name`. Any row order.

Two lessons compose: a date range on `customers`, and an anti-join to
`orders`. Any of the three anti-join idioms is fine.

Run: `uv run dojo test 12_fundamentals_capstone ex4`

## Exercise 5 — "Show me the trend, not the total"

> *From: CFO, again. "The quarterly number is fine but I can't see the
> shape. Give me paid revenue by month for calendar 2023, in order, with
> the order counts next to it."*

Edit `ex5/solution.sql`. For **paid** orders created in calendar year 2023
(`>= '2023-01-01'` and `< '2024-01-01'`), one row per calendar month.

Columns in this order: `month` (the month truncated with
`date_trunc('month', created_at)`), `orders` (count), `revenue` (sum of
`total`). **Ordered by month ascending.**

Expect 11 rows, not 12 — the data stops on 2023-11-14. A trend report that
silently ends early is a reporting bug you should be able to *see* coming;
this is what a partial period looks like.

Run: `uv run dojo test 12_fundamentals_capstone ex5`

## Exercise 6 — "What were our five best sellers in Q3?"

> *From: Merchandising. "Top five products by units sold last quarter —
> real orders only, same definition as before. Name and category."*

Edit `ex6/solution.sql`. Across `orders` → `order_items` → `products`, for
orders whose `status` is `'paid'` or `'shipped'` **and** whose `created_at`
falls in Q3 2023, return the five products with the most units sold.

Columns in this order: `id` (the product's), `name`, `category`, `units`
(sum of `quantity`). **Ordered by `units` descending, tie-broken by `id`
ascending, exactly 5 rows.**

"Same definition as before" is the requester assuming you remember what
they meant by *real orders* in exercise 2 and 3. They will not always be
this consistent — write the definition down where the query can be read.

Run: `uv run dojo test 12_fundamentals_capstone ex6`

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


def test_ex4(shared_lesson_db):
    ex = L.exercise("ex4")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


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
