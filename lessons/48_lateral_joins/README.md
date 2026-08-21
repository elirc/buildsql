# 48 — LATERAL joins

> **Part 7 — Advanced patterns (bonus).** You have finished the course. These
> three lessons cover patterns that don't fit the beginner-to-performance arc
> but that you will reach for constantly in real reporting work. No new gate
> machinery — just correctness gates, like Parts 1–2.

You already know how to get *one* aggregate per group (`GROUP BY`, lesson 07)
and how to rank rows *within* a group (window functions, lesson 15). But some
questions want neither: they want, for each group, a **whole small result
set** — "the three most expensive products in every category", "each
department's two top earners". A subquery could compute that for one category;
the trick is running it once *per* category and gluing the pieces together.

That is what `LATERAL` does. A normal subquery in `FROM` is self-contained —
it cannot see the other tables in the same `FROM`. A `LATERAL` subquery *can*:
it is evaluated once for each row produced on its left, with that row's columns
in scope. It turns a subquery into a per-row function call.

## Concept

```sql
SELECT c.category, t.name, t.price
FROM (SELECT DISTINCT category FROM products) c
CROSS JOIN LATERAL (
    SELECT name, price
    FROM products p
    WHERE p.category = c.category   -- references c — only legal because LATERAL
    ORDER BY price DESC, id
    LIMIT 3
) t;
```

Read it left to right: produce each distinct `category`; for **each** one, run
the parenthesised subquery with `c.category` bound to that value; the subquery
returns up to three rows; emit them. Without `LATERAL`, the `WHERE p.category =
c.category` reference to `c` is an error — the subquery would have no idea what
`c` is.

Things worth internalising:

- `CROSS JOIN LATERAL (…)` is the common form. `JOIN LATERAL (…) ON true` is
  the same thing. A set-returning function in `FROM` (like
  `jsonb_array_elements`) is *implicitly* lateral — it can already see earlier
  tables — so you rarely write the keyword there.
- The killer feature is a **`LIMIT` that runs per group**. Window functions
  rank rows but still hand you the whole partition; `LATERAL … LIMIT n` stops
  at `n` rows per driving row, which is both what you asked for and cheaper.
- If the lateral subquery returns no rows for some driving row, `CROSS JOIN`
  drops that driving row (like an inner join). Use `LEFT JOIN LATERAL (…) ON
  true` to keep it with NULLs.
- Order the subquery deterministically (`ORDER BY price DESC, id`) so "top n"
  is well defined when prices tie.

## Exercise 1 — top three products per category

Edit `ex1/solution.sql`. For every product `category`, return the three most
expensive products in it: columns `category`, `name`, `price`. Six categories
× three = **18 rows**, any order. (Break price ties by `id` so exactly three
come back per category.)

Run: `uv run dojo test 48_lateral_joins ex1`

## Exercise 2 — each department's two top earners

Edit `ex2/solution.sql`. For every `department` in `staff`, return the two
highest-paid people: columns `department`, `name`, `salary`. Five departments
× two = **10 rows**, any order.

Run: `uv run dojo test 48_lateral_joins ex2`

## Exercise 3 — each customer's two most recent orders

Edit `ex3/solution.sql`. For every customer with `id <= 20`, return their
two most recent orders.

Columns, in this order: `customer_id`, `id` (the order's), `created_at`.
Any row order. (Customers 1–20 all have orders, so expect 40 rows.)

The shape is the same as exercise 1 with a different "top N per group", and
it is worth noticing what `LATERAL` buys here that `row_number()` does not:
the inner query runs **per customer** and stops after two rows, so with an
index on `(customer_id, created_at DESC)` it reads exactly forty index
entries. The window-function version numbers *every* order of all twenty
customers and then throws away all but two per group.

For small N over many groups, that difference is the whole reason `LATERAL`
exists.

Run: `uv run dojo test 48_lateral_joins ex3`

## Exercise 4 — LATERAL as an unpivot

Edit `ex4/solution.sql`. Turn each product's JSONB attributes into rows.
For products with `id <= 5`, produce one row per (product, attribute) pair
for the two scalar attributes `color` and `size`.

Columns, in this order: `id`, `attr` (the literal text `'color'` or
`'size'`), `value` (the extracted text). **10 rows** (5 products × 2
attributes), any order.

The idiom is lesson 17's unpivot:

```sql
CROSS JOIN LATERAL (VALUES ('color', attributes ->> 'color'),
                           ('size',  attributes ->> 'size')) AS v(attr, value)
```

An ordinary subquery in `FROM` cannot mention `attributes`, because
`FROM` items are evaluated independently. `LATERAL` lifts exactly that
restriction: it means "this `FROM` item may see the rows to its left".
Once you read it that way, `LATERAL` stops being a special join type and
becomes the obvious answer to *for each row, compute something*.

Run: `uv run dojo test 48_lateral_joins ex4`

## Challenge — average price of each category's five priciest (optional)

Edit `challenge/solution.sql`. For every `category`, return `category` and
`avg_top5`: the average `price` of that category's five most expensive
products, rounded to 2 decimals. **6 rows**, any order.

Difficulty note: the ordering matters *before* the aggregate — you must pick
the five rows first, then average them. A single `AVG(...) GROUP BY category`
averages the entire category and is wrong. Nest a subquery inside the LATERAL.

Run: `uv run dojo test 48_lateral_joins challenge`

## The gate

```python
"""Gates for 48_lateral_joins. Quoted verbatim in README.md."""
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


def test_ex4(shared_lesson_db):
    ex = L.exercise("ex4")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


@pytest.mark.challenge
def test_challenge(shared_lesson_db):
    ex = L.exercise("challenge")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
```

Each gate runs the reference query and your query against the same clone and
compares the rows as a set. Right rows in any order pass.

## The teaching point

The moment a requirement contains the words "top N per" or "the most recent
few per", reach for `LATERAL`. It is the clean answer to the top-N-per-group
problem that window functions solve awkwardly (rank, then filter in an outer
query) and correlated subqueries solve unreadably. It also composes: the
lateral subquery can join, aggregate, and limit — a whole query per driving
row. Query planners handle it well, especially when the inner table has an
index on the correlation column (a Part 5 idea: an index on
`products(category, price)` turns each lateral probe into a cheap index scan).

Next: **49_distinct_on** — the one-row-per-group shortcut.
