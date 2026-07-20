# 13 — Subqueries

You've already smuggled two subqueries past customs: lesson 05's `NOT IN
(SELECT manager_id ...)` and lesson 06's scalar KPIs. Part 2 starts by
making them official. A subquery is a complete query used as a *value*, a
*list*, or a *test* inside another query — and choosing which of the three
you're writing is most of the skill.

## Concept

**Scalar** — returns one value; usable anywhere a value goes:

```sql
SELECT id, name, price
FROM products
WHERE price > (SELECT avg(price) FROM products);
```

**List** — returns one column; feeds `IN` / `NOT IN`:

```sql
WHERE id IN (SELECT order_id FROM order_items WHERE quantity = 5)
```

**Correlated** — mentions the outer row, so it conceptually re-runs per
row (you met one in lesson 03's challenge):

```sql
WHERE o.created_at = (SELECT max(o2.created_at)
                      FROM orders o2
                      WHERE o2.customer_id = o.customer_id)
```

**EXISTS / NOT EXISTS** — the test form: "does at least one such row
exist?" It returns true/false, never NULL, and doesn't care what you
SELECT inside (the conventional `SELECT 1` signals "presence only"):

```sql
SELECT c.id FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
```

This is the third anti-join you've met (lesson 09's LEFT-JOIN-IS-NULL,
lesson 11's EXCEPT) — and the one to reach for by default: unlike
`NOT IN` it is **immune to lesson 05's NULL trap**, because each row's
test is a plain exists-check, not a comparison with a possibly-NULL list
element.

## Exercise 1 — above-average products (scalar)

Edit `ex1/solution.sql`. Every product priced strictly above the average
product price. Columns: `id`, `name`, `price`. Any order.

Run: `uv run dojo test 13_subqueries ex1`

## Exercise 2 — orders containing a luxury item (list)

Edit `ex2/solution.sql`. Every order that includes at least one product
priced over 490. Columns: `id`, `total`. Any order. Use `IN` with a
subquery that joins `order_items` to `products`. (No DISTINCT needed —
`IN` never duplicates outer rows, which is itself worth remembering: a
plain JOIN here *would* duplicate orders containing two luxury items.)

Run: `uv run dojo test 13_subqueries ex2`

## Exercise 3 — NOT EXISTS anti-join

Edit `ex3/solution.sql`. Spanish (`'ES'`) customers who have never placed
an order. Columns: `id`, `name`. Any order. Use `NOT EXISTS` this time —
same rows as lesson 09's pattern, sturdier idiom.

Run: `uv run dojo test 13_subqueries ex3`

## Challenge — latest order per customer (correlated)

Edit `challenge/solution.sql`. For customers with `id <= 10`, their most
recent order: `customer_id`, order `id`, `created_at`. Any order. The
correlated pattern from the concept section is the intended tool: an
order qualifies if its `created_at` equals the max for *that customer*.
(Customers 1–10 all have orders, and no customer has two orders on the
same timestamp — the seed guarantees both.)

Run: `uv run dojo test 13_subqueries challenge`

## Spaced review

`review1/`: staff earning strictly more than **their own department's**
average salary — columns `id`, `name`, any order. (Correlated scalar:
the inner query averages the *outer row's* department.)

## The gate

```python
"""Gates for 13_subqueries. Quoted verbatim in README.md."""
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

Subquery-vs-join is rarely about performance — PostgreSQL's planner
rewrites most IN/EXISTS forms into joins internally (you'll watch it do
so in Part 5's plans). It's about *stating intent*: EXISTS says "I'm
testing presence", IN says "membership in this list", a scalar comparison
says "against this one number". Write the form that reads as the
question; let the planner pick the algorithm.

Next: **14_ctes** — naming your subqueries, and recursion.
