# 83 - Drills: subqueries 1

Eight problems on the four places a subquery can stand: as a value in
`WHERE`, as a value in the `SELECT` list, as a list for `IN`, and as a table
in `FROM`. This set drills lesson 13. The recurring decision is whether the
subquery needs to know anything about the outer row - correlated - or can be
worked out once and reused.

## Exercise 1

`toys` products priced above the average price **of toys**. Columns, in this
order: `id`, `name`, `price`.

**Ordered by `id` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 83_drills_subqueries_1 ex1`

## Exercise 2

For customers with `id <= 12`: how many orders they have placed and the
`total` of their largest order. A customer with no orders reports `0` and
NULL. Columns, in this order: `id`, `name`, `orders`, `biggest`.

**Ordered by `id` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 83_drills_subqueries_1 ex2`

## Exercise 3

`garden` products that have been sold in a quantity of exactly 5 on an order
created on or after `2023-11-01`. Each product appears once. Columns, in this
order: `id`, `name`.

**Ordered by `id` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 83_drills_subqueries_1 ex3`

## Exercise 4

`clothing` products that have received **no** 1-star review created on or
after `2023-11-01`. Columns, in this order: `id`, `name`.

**Ordered by `id` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 83_drills_subqueries_1 ex4`

## Exercise 5

Members of `staff` who earn more than the average salary of the team they
belong to - where a team means everyone sharing the same `manager_id`. The
CEO, who has no manager, is excluded. Columns, in this order: `id`, `name`,
`salary`.

**Ordered by `id` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 83_drills_subqueries_1 ex5`

## Exercise 6

Customers with **at least 15 non-cancelled orders**. Columns, in this order:
`customer_id`, `orders` (how many non-cancelled orders), `revenue` (the sum
of their `total`).

**Ordered by `revenue` descending, then `customer_id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 83_drills_subqueries_1 ex6`

## Exercise 7

Customers whose non-cancelled revenue is **more than twice the average
customer's** non-cancelled revenue. The average is over customers, not over
orders: build one revenue figure per customer, then average those. Columns,
in this order: `customer_id`, `revenue`.

**Ordered by `revenue` descending, then `customer_id` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 83_drills_subqueries_1 ex7`

## Exercise 8

Departments whose average salary is above the **company-wide** average
salary. For each, report the department, how many people are in it, and the
name of its highest-paid member - ties broken by the lower staff `id`.
Columns, in this order: `department`, `staff`, `top_earner`.

**Ordered by `department` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 83_drills_subqueries_1 ex8`

## The gate

```python
"""Gates for 83_drills_subqueries_1. Quoted verbatim in README.md."""
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
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex4(shared_lesson_db):
    ex = L.exercise("ex4")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


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


def test_ex7(shared_lesson_db):
    ex = L.exercise("ex7")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex8(shared_lesson_db):
    ex = L.exercise("ex8")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)
```

Each gate runs the reference query and yours against the same clone and
compares the rows **in order**. Exercise 2 is deliberately the slow spelling
of an easy question - if it takes several seconds, that is the correlated
subquery being re-run per customer, and the reading explains what to do about
it in production.

Next: **`84_drills_subqueries_2`**.
