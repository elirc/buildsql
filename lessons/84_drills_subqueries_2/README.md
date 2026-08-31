# 84 - Drills: subqueries 2

Eight problems on the subquery forms that come after the basics: `ANY` and
`ALL`, row-constructor `IN`, a subquery inside `HAVING`, correlated counting,
and a derived table that supplies the value a correlated subquery correlates
on. This set drills lesson 13. Several of these have a fast spelling and a
catastrophically slow one that returns the same rows - the reading says which
is which.

## Exercise 1

Members of `staff` who earn more than **every** `engineering` employee whose
salary is below 60000. Columns, in this order: `id`, `name`, `department`,
`salary`.

**Ordered by `id` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 84_drills_subqueries_2 ex1`

## Exercise 2

`toys` products priced above **at least one** `electronics` product priced
above 490. Columns, in this order: `id`, `name`, `price`.

**Ordered by `id` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 84_drills_subqueries_2 ex2`

## Exercise 3

Per category: the average product price rounded to 2 decimal places, and how
many of that category's products are priced above that (unrounded) average.
Columns, in this order: `category`, `avg_price`, `above_average`.

**Ordered by `category` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 84_drills_subqueries_2 ex3`

## Exercise 4

For every member of the `engineering` department: their id, name, `hired_on`
date, and the **salary of the person hired immediately before them within the
same department**. Order of hire is `hired_on`, with the lower staff `id`
counting as earlier when two people share a date. The earliest hire in the
department reports NULL. Columns, in this order: `id`, `name`, `hired_on`,
`previous_hire_salary`.

**Ordered by `id` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 84_drills_subqueries_2 ex4`

## Exercise 5

Among customers with `id <= 10000`, counting only **non-cancelled** orders:
the customers who have placed more orders than the average customer in that
same population. Columns, in this order: `customer_id`, `orders`.

**Ordered by `orders` descending, then `customer_id` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 84_drills_subqueries_2 ex5`

## Exercise 6

Orders created in **October 2023** (`>= '2023-10-01'` and `< '2023-11-01'`)
whose `(customer_id, status)` pair also occurs on some order created **on or
after 2023-11-01**. Both values must match. Columns, in this order: `id`,
`customer_id`, `status`.

**Ordered by `id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 84_drills_subqueries_2 ex6`

## Exercise 7

For every `books` product priced above 495: its id, name, price, and how many
**other `books` products are strictly cheaper** than it. Columns, in this
order: `id`, `name`, `price`, `cheaper_books`.

**Ordered by `id` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 84_drills_subqueries_2 ex7`

## Exercise 8

The most typical person in each department: the one whose salary is nearest
to their department's average, with the lower staff `id` winning a tie.
Columns, in this order: `department`, `most_typical` (their name),
`typical_salary` (their salary), `avg_salary` (the department average rounded
to 2 decimal places).

**Ordered by `department` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 84_drills_subqueries_2 ex8`

## The gate

```python
"""Gates for 84_drills_subqueries_2. Quoted verbatim in README.md."""
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
compares the rows **in order**. If a query in this set takes a minute rather
than a second, it is almost certainly correlating from the large side -
exercise 3's reading explains the fix, and it applies to half the set.

This is the last of the join and subquery drill sets. Next:
**`85_drills_subqueries_3`**.
