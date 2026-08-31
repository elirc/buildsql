# 80 - Drills: set operations

Eight problems on `UNION`, `INTERSECT` and `EXCEPT`: what each one does to
duplicates, what `ALL` changes, where the `ORDER BY` goes, and the operator
precedence that silently answers a different question. This set drills lesson
11. Every answer here is a set of ids or pairs, so the row counts themselves
are part of the feedback.

## Exercise 1

One list of customer ids: everybody in country `MX`, together with everybody
who signed up before `2022-01-01`. Anyone who qualifies on both counts
appears **once**. Column: `id`.

**Ordered by `id` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 80_drills_set_ops_1 ex1`

## Exercise 2

The same two lists, stacked **without** removing duplicates - so a customer
who satisfies both conditions appears twice. Column: `id`.

**Ordered by `id` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 80_drills_set_ops_1 ex2`

## Exercise 3

Product ids that were **both** sold in a quantity of 5 on an order created on
or after `2023-11-01` **and** given a 1-star review created on or after
`2023-11-01`. Each product id appears once. Column: `product_id`.

**Ordered by `product_id` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 80_drills_set_ops_1 ex3`

## Exercise 4

Product ids that appear in `reviews` but **never** in `order_items`. Each
appears once. Column: `product_id`.

**Ordered by `product_id` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 80_drills_set_ops_1 ex4`

## Exercise 5

Two columns this time. Take every `(customer_id, status)` pair that occurs on
an order created in **October 2023** (`>= '2023-10-01'` and `< '2023-11-01'`)
and remove every pair that also occurs on an order created **on or after
2023-11-01**. A pair is removed only when **both** values match. Columns, in
this order: `customer_id`, `status`.

**Ordered by `customer_id` ascending, then `status` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 80_drills_set_ops_1 ex5`

## Exercise 6

Multiplicity matters here. Restricting both sides to customers with `id <=
2000`: take the `customer_id` of every order created in **October 2023**
(`>= '2023-10-01'` and `< '2023-11-01'`) - one entry per order, duplicates
kept - and subtract the `customer_id` of every order created **on or after
2023-11-01**, again one entry per order. A customer with four October orders
and one November order must appear three times. Column: `customer_id`.

**Ordered by `customer_id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 80_drills_set_ops_1 ex6`

## Exercise 7

Combine the customer ids of everybody in country `JP` with the `customer_id`
of every order whose `total` is above 1995, remove duplicates, and return the
**10 smallest ids**. Column: `id`.

**Ordered by `id` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 80_drills_set_ops_1 ex7`

## Exercise 8

Product ids that are in category `toys` **and** satisfy at least one of the
following: they received a 1-star review created on or after `2023-11-01`, or
they were sold in a quantity of 5 on an order created on or after
`2023-11-01`. Each id appears once. Column: `product_id`.

**Ordered by `product_id` ascending.**

Write this one with set operators and read your own query back carefully
before you run it - the obvious spelling parses as something else.

Edit `ex8/solution.sql`. Run: `uv run dojo test 80_drills_set_ops_1 ex8`

## The gate

```python
"""Gates for 80_drills_set_ops_1. Quoted verbatim in README.md."""
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
compares the rows **in order**. Exercises 1 and 2 are deliberately the same
data with and without `ALL`; if they return the same number of rows, one of
them is wrong.

Next: **`81_drills_multi_join_1`**.
