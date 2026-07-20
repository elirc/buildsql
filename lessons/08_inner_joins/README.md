# 08 — INNER JOIN

`orders` knows a `customer_id`; it does not know the customer's name. The
name lives 500,000 row-lookups away in `customers`. A relational database
is *designed* around this separation — each fact stored once — and `JOIN`
is how you reassemble facts at query time. This is the single most
important lesson in Part 1.

## Concept

```sql
SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.total > 1990;
```

Read it as: for each row of `orders`, find the `customers` rows where the
ON condition holds, and emit one combined row per match. Details that
matter:

- `o` and `c` are **table aliases**. With two tables in play, every column
  reference should be qualified — `id` alone is now ambiguous and Postgres
  will say so.
- `JOIN` means `INNER JOIN`: rows with **no match are dropped**. An order
  whose customer vanished (impossible here, thanks to the FK) would
  silently disappear. Lesson 09 is about *keeping* such rows.
- The **ON clause is the join key**; the WHERE clause is your filter.
  Mixing them up works for INNER joins but becomes a real bug with OUTER
  ones — build the right habit now.
- Joins chain: orders → order_items → products walks two relationships in
  one query.
- Join then group: after joining line-items to products you can `GROUP BY
  p.category` and sum revenue — join and aggregation compose freely.

A wrong-ON join doesn't error — it either loses rows or multiplies them
(the dreaded accidental cross join: 500,000 × 50,000 rows). If a join
returns a suspicious row count, the ON clause is the first suspect.

## Exercise 1 — orders with names

Edit `ex1/solution.sql`. The 2,569 orders with `total > 1990`, each with
its customer's name. Columns in order: `id` (the order's), `name`,
`total`. Any row order.

Run: `uv run dojo test 08_inner_joins ex1`

## Exercise 2 — a receipt, three tables

Edit `ex2/solution.sql`. Print the line items of **order 123**: for each
item, the product's `name`, the item's `quantity`, and the item's `price`.
Route: `orders` → `order_items` (on order id) → `products` (on product
id). Three columns, three rows, any order.

Run: `uv run dojo test 08_inner_joins ex2`

## Exercise 3 — revenue per category

Edit `ex3/solution.sql`. Which product categories make the money? Join
`order_items` to `products` and return each `category` with its revenue —
the sum of `quantity * price` (the *item's* price: it's the historical
snapshot; product prices can change). Two columns, six rows, any order.

Run: `uv run dojo test 08_inner_joins ex3`

## Challenge — the five-table drill-down (optional)

Edit `challenge/solution.sql`. Customer service pulled up **customer
4242** and wants their purchase history with product reputation attached:
for every (order, product) pair this customer ever bought, return the
order `id`, the product `name`, the total units of that product in that
order (`sum(quantity)` — a product *can* appear on two lines of one
order), and the product's average review rating rounded to 1 decimal.

Tables: `customers`, `orders`, `order_items`, `products`, `reviews`.
Group by order id and product name. Columns: `order_id`, `product`,
`units`, `avg_rating`. Any order. (12 rows.)

Grain warning, and why this works: joining `reviews` multiplies each item
row by that product's ~100 reviews — but `avg(r.rating)` inside a group
that spans exactly one product still averages that product's reviews.
`sum(quantity)` would be inflated 100× though! The fix: `sum(DISTINCT
oi.id)`-style tricks are fragile; the honest fix is aggregating quantity
*before* the review join (subqueries, lesson 13) — here, since each
(order, product) group has one line item in practice for this customer,
`min(oi.quantity)`-style dodges also work. Simplest correct trick that
passes: use `avg(oi.quantity)::int` — every duplicated row carries the
same quantity, and the average of n copies of q is q. The hints walk
through it; the teaching point is *noticing* the grain problem at all.

Run: `uv run dojo test 08_inner_joins challenge`

## Spaced review

`review1/`: every order over 1950 placed by a customer in `'PH'`:
columns `name`, `id` (order), `total`, any order.

## The gate

```python
"""Gates for 08_inner_joins. Quoted verbatim in README.md."""
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

## The teaching point

In code review, the first question about any JOIN is "what's the
cardinality?" — one-to-one, one-to-many, many-to-many? The challenge just
showed you why: aggregates over a fanned-out join silently inflate.
Production dashboards have shipped 100× revenue numbers for exactly this
reason. Know the grain of every joined row set before you aggregate it.

Next: **09_outer_joins** — keeping the rows that don't match.
