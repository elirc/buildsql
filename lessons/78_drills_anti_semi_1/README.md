# 78 - Drills: anti-joins and semi-joins

Eight problems about presence and absence: customers who have never done a
thing, products nobody bought this month, orders where *every* line agrees.
This set draws on lessons 09 (the `LEFT JOIN ... IS NULL` anti-join) and 13
(`EXISTS` / `NOT EXISTS`, and why `NOT IN` is a trap). Exercise 4 will bite
you if you skipped the NULL lesson - that is intentional.

## Exercise 1

Customers in country `IN` who have **never placed a paid order**. Having
cancelled, pending or shipped orders is fine; having no orders at all is also
fine. Columns, in this order: `id`, `name`.

**Ordered by `id` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 78_drills_anti_semi_1 ex1`

## Exercise 2

Customers in country `IN` who have bought at least one product in the `books`
category - each customer appearing exactly once, however many books they
have bought. Columns, in this order: `id`, `name`.

**Ordered by `id` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 78_drills_anti_semi_1 ex2`

## Exercise 3

`garden` products priced above 480 that were **never sold in a quantity of 5
on an order created on or after 2023-11-01**. Both halves of that description
have to hold at once for a sale to disqualify a product. Columns, in this
order: `id`, `name`.

**Ordered by `id` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 78_drills_anti_semi_1 ex3`

## Exercise 4

Every member of `staff` who manages nobody - that is, no other staff row
names them as its `manager_id`. Columns, in this order: `id`, `name`,
`department`.

**Ordered by `id` ascending.**

The one-line answer you will reach for first returns zero rows. Work out why
before you take a hint; it is the most valuable ten minutes in this set.

Edit `ex4/solution.sql`. Run: `uv run dojo test 78_drills_anti_semi_1 ex4`

## Exercise 5

Customers in country `JP` who **have ordered** at least once but have
**never bought an `electronics` product**. Columns, in this order: `id`,
`name`.

**Ordered by `id` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 78_drills_anti_semi_1 ex5`

## Exercise 6

`books` products that received at least one **5-star** review on or after
`2023-11-01` and **no 1-star** review in that same window. Columns, in this
order: `id`, `name`.

**Ordered by `id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 78_drills_anti_semi_1 ex6`

## Exercise 7

Churn. Customers in country `US` who placed at least one order in **October
2023** (`>= '2023-10-01'` and `< '2023-11-01'`) and **no order at all** on or
after `2023-11-01`. Columns, in this order: `id`, `name`.

**Ordered by `id` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 78_drills_anti_semi_1 ex7`

## Exercise 8

Orders created on or after `2023-11-01` that have **at least one line** and
where **every** line has `quantity = 5`. Columns, in this order: `id`,
`status`, `total`.

**Ordered by `id` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 78_drills_anti_semi_1 ex8`

## The gate

```python
"""Gates for 78_drills_anti_semi_1. Quoted verbatim in README.md."""
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
compares the rows **in order**. Every answer in this set is one row per
entity, so a row count that is a large multiple of the expected one means
your join duplicated - reach for `EXISTS` rather than for `DISTINCT`.

Next: **`79_drills_self_joins_1`**.
