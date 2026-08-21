# 14 — CTEs: WITH, chains, and recursion

Lesson 13's subqueries nest inward — by the third level of parentheses,
nobody can read them. A **Common Table Expression** turns nesting into a
pipeline: name an intermediate result, then build on the name.

## Concept

```sql
WITH heavy_buyers AS (
    SELECT customer_id, count(*) AS n
    FROM orders
    GROUP BY customer_id
    HAVING count(*) > 20
)
SELECT c.name, hb.n
FROM heavy_buyers hb
JOIN customers c ON c.id = hb.customer_id;
```

- CTEs **chain**: `WITH a AS (...), b AS (SELECT ... FROM a), c AS
  (SELECT ... FROM b)` — each step reads like a paragraph. This is how
  analysts actually write 100-line reports.
- A CTE can be referenced twice — handy when a result is both displayed
  and aggregated against.
- Since PostgreSQL 12, plain CTEs are usually inlined into the main query
  by the planner — write them for **readability**, not as an optimization
  fence (add `AS MATERIALIZED` in the rare case you need one; Part 5
  territory).

**Recursion.** The form that does something joins genuinely can't:

```sql
WITH RECURSIVE org AS (
    SELECT id, name, 1 AS depth          -- base case: the CEO
    FROM staff WHERE manager_id IS NULL
    UNION ALL
    SELECT s.id, s.name, org.depth + 1   -- step: everyone managed by
    FROM staff s                         --       someone already in org
    JOIN org ON s.manager_id = org.id
)
SELECT * FROM org;
```

Postgres runs the base case, then re-runs the step against the *newest*
rows until a step adds nothing. Lesson 10's self-join reached one level;
this walks all four levels of our org chart — or forty, without changing
a character.

## Exercise 1 — name the intermediate step

Edit `ex1/solution.sql`. The heavy-buyers report, finished: customers
with more than 20 orders, with names attached. Columns: `id`, `name`,
`n` (their order count). Any order. Use a CTE for the aggregation, then
join customers to it. (250 rows.)

Run: `uv run dojo test 14_ctes ex1`

## Exercise 2 — a chained pipeline

Edit `ex2/solution.sql`. Which categories out-earn the average category?
Step 1 (CTE): revenue per category from `order_items` × `products` (sum
of `quantity * price`). Step 2: keep the categories whose revenue exceeds
the average of those six revenues. Columns: `category`, `revenue`. Any
order. (A second CTE or a scalar subquery over the first both work.)

Run: `uv run dojo test 14_ctes ex2`

## Exercise 3 — the whole org chart

Edit `ex3/solution.sql`. Every staff member with their depth in the org
tree: CEO = 1, her direct reports = 2, and so on. Columns: `id`, `name`,
`depth`. All 500 rows, any order. The concept section gives you the
skeleton — type it, don't paste it, and make sure you can say *why* the
UNION ALL step terminates.

Run: `uv run dojo test 14_ctes ex3`

## Exercise 4 — two CTEs, joined

Edit `ex4/solution.sql`. The market overview: for each customer
`country`, how many customers we have there and how much those customers
have spent in total (all orders, any status).

Columns, in this order: `country`, `customers` (count), `revenue` (sum of
order totals). Twelve rows, any order.

Build it as two named steps and join them: one CTE counting customers per
country, another summing revenue per country, then a join on `country`.

You could do this in one query with a single join and two aggregates — try
it, and check the customer count carefully. Joining `customers` to `orders`
first duplicates each customer once per order, so `count(*)` counts orders
and `count(DISTINCT c.id)` becomes necessary. Aggregating each side
*separately* and joining the small results afterwards sidesteps the grain
problem entirely, and that is a pattern worth having in your hands.

Run: `uv run dojo test 14_ctes ex4`

## Exercise 5 — recursion without a hierarchy

Edit `ex5/solution.sql`. Produce the integers **1 through 12**, one per
row, in a single column named `n`, using `WITH RECURSIVE` — no table
involved at all.

Twelve rows, any order.

Recursion is not only for trees. The base case is `SELECT 1`, the step adds
one to what it has, and the `WHERE n < 12` inside the recursive branch is
the **termination condition** — remove it and PostgreSQL will happily count
forever. (Ctrl-C is your friend; the lab is a throwaway clone.)

Being able to generate a series matters more than it looks: it is how you
produce the months a `GROUP BY` cannot invent, so a report can show a zero
instead of a missing bar. PostgreSQL also ships `generate_series(1, 12)`,
which is what you would actually use — but writing the recursion once
teaches you what it does.

Run: `uv run dojo test 14_ctes ex5`

## Exercise 6 — one person's whole subtree

Edit `ex6/solution.sql`. Employee **2** is being promoted, and HR needs
everyone in their reporting tree — direct reports, their reports, all the
way down — plus employee 2 themself.

Columns: `id`, `name`, `depth` (employee 2 is depth 1, their direct
reports 2, and so on). Any row order.

Exercise 3 started the recursion at the CEO (`manager_id IS NULL`). The
only change here is the base case: start at one specific row. That is the
whole trick to subtree queries, and it is why the adjacency-list model plus
a recursive CTE is enough for almost every hierarchy problem you will
meet.

Run: `uv run dojo test 14_ctes ex6`

## Challenge — the management chain (optional)

Edit `challenge/solution.sql`. Walk **upward**: for employee 442, produce
their management chain from the employee themself up to the CEO.
Columns: `pos` (1 = employee 442, 2 = their manager, ...), `id`, `name`.
**Ordered by `pos` ascending.** The base case is employee 442; the step
joins on *the current row's manager_id* — recursion upward instead of
downward.

Run: `uv run dojo test 14_ctes challenge`

## Spaced review

`review1/`: with a CTE named however you like: pending-order revenue per
customer country. Columns: `country`, `revenue` (sum of totals of
`'pending'` orders). Any order.

## The gate

```python
"""Gates for 14_ctes. Quoted verbatim in README.md."""
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


def test_ex5(shared_lesson_db):
    ex = L.exercise("ex5")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex6(shared_lesson_db):
    ex = L.exercise("ex6")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


@pytest.mark.challenge
def test_challenge(shared_lesson_db):
    ex = L.exercise("challenge")
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

In production codebases the CTE pipeline is the difference between a
report someone can review and one they rubber-stamp. Name each step after
its *business meaning* (`qualified_orders`, `first_purchases`), keep each
step testable by running the WITH-prefix alone — that's also exactly how
you debug one: run it CTE by CTE until the numbers stop making sense.

Next: **15_window_functions_1** — per-row answers that see the whole set.
