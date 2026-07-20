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
