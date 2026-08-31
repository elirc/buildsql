# 86 - Drills: EXISTS and NOT EXISTS

Eight problems on the semi-join and the anti-join - "at least one matching row"
and "no matching row at all" - from lesson 13. Set 78 drilled `EXISTS` as a
filter; this set also projects it as a column, aggregates over it, nests it,
and walks head-first into the `NULL` that silently empties a `NOT IN`.

## Exercise 1 - a yes/no column

Everyone in the `sales` department, with a flag saying whether they manage
anybody. Columns, in this order: `id`, `name`, `salary`, `manages` - a boolean
that is true when at least one staff row has this person's `id` as its
`manager_id`.

`EXISTS (...)` is an expression of type boolean, so it can go straight into
the `SELECT` list.

**Ordered by `id` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 86_drills_exists_1 ex1`

## Exercise 2 - never bought anything, by country

For each country, how many of its customers have no orders at all. Columns, in
this order: `country`, `never_ordered`. Countries where every customer has
ordered simply do not appear.

**Ordered by `country` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 86_drills_exists_1 ex2`

## Exercise 3 - the big spenders of the Philippines

Customers in country `PH` who have placed at least one order that is **not**
`cancelled` and whose `total` is above 1900. Columns, in this order: `id`,
`name` - one row per customer, however many qualifying orders they have.

**Ordered by `id` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 86_drills_exists_1 ex3`

## Exercise 4 - manage nobody, written with NOT IN

The staff who are nobody's manager. Columns, in this order: `id`, `name`,
`department`, `salary`.

Write this one with `NOT IN (SELECT manager_id FROM staff ...)`, not with
`NOT EXISTS`. Spelled naively it returns **zero rows**, because the CEO's
`manager_id` is `NULL` and `x NOT IN (1, 2, NULL)` is never true. Your job is
to add the guard that makes the `NOT IN` form correct.

**Ordered by `id` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 86_drills_exists_1 ex4`

## Exercise 5 - the cheapest thing in each category

The single cheapest product in each category, found without a `GROUP BY`: a
product is cheapest in its category when **no** product in that same category
costs less. Columns, in this order: `id`, `name`, `category`, `price`.

**Ordered by `category` ascending, then `id` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 86_drills_exists_1 ex5`

## Exercise 6 - praised but never sold

Products in the `toys` category that have never appeared in any order item and
yet have at least one 5-star review. Columns, in this order: `id`, `name`,
`price`.

**Ordered by `id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 86_drills_exists_1 ex6`

## Exercise 7 - electronics, unaccompanied

Customers in country `BR` who have at least one order that contains an
`electronics` product and contains **no** `books` product. Both conditions are
about the same order, not about the customer's history as a whole. Columns, in
this order: `id`, `name`.

**Ordered by `id` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 86_drills_exists_1 ex7`

## Exercise 8 - managers of managers

The staff who have at least one direct report who in turn has at least one
direct report. Columns, in this order: `id`, `name`, `department`.

**Ordered by `id` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 86_drills_exists_1 ex8`

## The gate

```python
"""Gates for 86_drills_exists_1. Quoted verbatim in README.md."""
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

Every gate runs the reference query and yours against the same clone and
compares the rows **in order**. Exercise 4 is the one to watch: if your query
returns no rows at all, that is not a typo, it is three-valued logic, and the
reading explains exactly which comparison went to `NULL`.

Next: **87_drills_ctes_1**, on naming intermediate results with `WITH`.
