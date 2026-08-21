# 27 — Views: names for queries

Lesson 12's "real revenue" definition — paid or shipped, nothing else —
got re-typed in lesson after lesson. In a company, that definition lives
in dozens of dashboards, and the day someone decides refunds count
negative, most of them will be wrong. A **view** is SQL's answer: give
the query a name, query the name.

## Concept

```sql
CREATE VIEW customer_spend AS
SELECT c.id AS customer_id, c.name,
       coalesce(sum(o.total) FILTER (WHERE o.status IN ('paid', 'shipped')),
                0) AS spend
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name;
```

- A view stores **no data** — it's a saved query, expanded at run time.
  `SELECT * FROM customer_spend WHERE spend > 100` re-runs the whole
  aggregation. (A *materialized* view stores results; that's lesson 46,
  and the difference is the whole point of both lessons.)
- Views stack: a view can select from a view. One or two layers deep is
  clarifying; five is archaeology. Because each query re-expands the full
  stack, views **name** cost, they never remove it — a fast-looking
  `SELECT * FROM top_spenders` may hide a 500,000-row aggregation. In
  Part 5 you'll EXPLAIN through a view and watch it unfold.
- The LEFT JOIN + `coalesce(..., 0)` above is deliberate: lesson 09's
  never-ordered customers must appear with spend 0, not vanish. Business
  definitions encoded in views deserve the same NULL rigor as any query.

## Exercise 1 — encode the revenue definition

Edit `ex1/solution.sql`. Create view `customer_spend` with columns
`customer_id`, `name`, `spend` — every customer (all 50,000, including
the 5,003 who never ordered, at 0), where spend sums the totals of their
`paid` and `shipped` orders. The concept block is the spec.

Run: `uv run dojo test 27_views ex1`

## Exercise 2 — a view over the view

Edit `ex2/solution.sql`. Create view `top_spenders`: the rows of
`customer_spend` with `spend > 20000`, same three columns. (Your ex1
view is created first automatically.) Notice what you did *not* have to
repeat: the status list, the join, the coalesce — that's the entire
value proposition.

Run: `uv run dojo test 27_views ex2`

## Exercise 3 — a definition worth sharing

Edit `ex3/solution.sql`. Create view **`category_revenue`** with two
columns, `category` and `revenue`: for each product category, the
line-item revenue (`sum(quantity * price)` from `order_items`) of orders
whose `status` is `'paid'` or `'shipped'`.

Six rows when queried.

This is lesson 12's revenue definition again, and this time it stops
being re-typed. Everything contentious about the number — which statuses
count, whether revenue means line items or order totals, whether it is the
line's historical price or the product's current one — is now written down
in exactly one place. When somebody disagrees, there is one object to
argue with and one change to make.

Run: `uv run dojo test 27_views ex3`

## Exercise 4 — a view that names a population

Edit `ex4/solution.sql`. Create view **`active_customers`** with three
columns, `id`, `name`, `country`: every customer who has at least one
order with status `'paid'` or `'shipped'`.

The previous views named a *measure*. This one names a **population** —
who counts as "active" — and populations are argued about even more than
measures. Encoding it as a view means every report that says "active
customers" is talking about the same people, and changing the definition
changes all of them at once.

Use `EXISTS` rather than a join: a customer with forty qualifying orders
must appear once, and `EXISTS` gives you that without a `DISTINCT` bolted
on top.

Run: `uv run dojo test 27_views ex4`

## The gate

```python
"""Gates for 27_views. Quoted verbatim in README.md."""
from dojo import catalog, grader
from dojo.lesson import Lesson

L = Lesson(__file__)

SPEND_QUERY = """
    SELECT c.id, c.name,
           coalesce(sum(o.total) FILTER (WHERE o.status IN ('paid', 'shipped')), 0)
    FROM customers c
    LEFT JOIN orders o ON o.customer_id = c.id
    GROUP BY c.id, c.name
"""


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_view(lesson_db, "customer_spend")
    expected = lesson_db.execute(SPEND_QUERY).fetchall()
    actual = lesson_db.execute(
        "SELECT customer_id, name, spend FROM customer_spend").fetchall()
    grader.assert_rows_equal(actual, expected)


def test_ex2(lesson_db):
    lesson_db.execute(L.exercise("ex1").solution_sql)
    ex = L.exercise("ex2")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_view(lesson_db, "top_spenders")
    expected = lesson_db.execute(
        f"SELECT * FROM ({SPEND_QUERY}) t(customer_id, name, spend) "
        "WHERE spend > 20000").fetchall()
    actual = lesson_db.execute(
        "SELECT customer_id, name, spend FROM top_spenders").fetchall()
    grader.assert_rows_equal(actual, expected)


def test_ex3(lesson_db):
    ex = L.exercise("ex3")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_view(lesson_db, "category_revenue")
    expected = lesson_db.execute("""
        SELECT p.category, sum(oi.quantity * oi.price)
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p     ON p.id = oi.product_id
        WHERE o.status IN ('paid', 'shipped')
        GROUP BY p.category
    """).fetchall()
    actual = lesson_db.execute(
        "SELECT category, revenue FROM category_revenue").fetchall()
    grader.assert_rows_equal(actual, expected)


def test_ex4(lesson_db):
    ex = L.exercise("ex4")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_view(lesson_db, "active_customers")
    expected = lesson_db.execute("""
        SELECT c.id, c.name, c.country
        FROM customers c
        WHERE EXISTS (SELECT 1 FROM orders o
                      WHERE o.customer_id = c.id
                        AND o.status IN ('paid', 'shipped'))
    """).fetchall()
    actual = lesson_db.execute(
        "SELECT id, name, country FROM active_customers").fetchall()
    grader.assert_rows_equal(actual, expected)
```

## The teaching point

Views shine as the **single source of business definitions** ("active
user", "net revenue", "qualified lead") and as stable interfaces over
schemas you intend to refactor. They fail when treated as free
performance — a dashboard querying a five-view stack re-aggregates
millions of rows per page load, and nobody can see it in the SQL. The
review question for every view: *is this naming a definition, or hiding
a cost?* The first is architecture; the second is a lesson-46 problem
wearing lesson-27 clothes.

Next: **28_altering_live_schemas** — changing tables that are in use.
