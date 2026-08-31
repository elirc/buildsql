# 57 - Drills: comparisons, IN, BETWEEN

Eight problems on the value-set half of `WHERE` - lesson 02. Comparisons,
`IN`, `NOT IN`, `BETWEEN`, and the ways each of them quietly includes or
excludes an endpoint. Redo 02 first if the difference between `<` and `<=`
has ever cost you a row.

## Exercise 1 - one comparison

Edit `ex1/solution.sql`. The clearance shelf takes anything under five
dollars. Return every product whose `price` is **strictly less than 5**.
Three columns, in this order: `id`, `name`, `price`. Any row order.

Run: `uv run dojo test 57_drills_where_1 ex1`

## Exercise 2 - equality on text

Edit `ex2/solution.sql`. The engineering director wants her roster. Return
every member of `staff` whose `department` is exactly `engineering`. Four
columns, in this order: `id`, `name`, `department`, `salary`. Any row order.

Run: `uv run dojo test 57_drills_where_1 ex2`

## Exercise 3 - comparing dates

Edit `ex3/solution.sql`. The ten-year-service awards need candidates. Return
every member of `staff` hired **before 1 January 2015** - `hired_on` strictly
earlier than that date. Three columns, in this order: `id`, `name`,
`hired_on`. Any row order.

Run: `uv run dojo test 57_drills_where_1 ex3`

## Exercise 4 - a short list of values

Edit `ex4/solution.sql`. The customer-facing teams are being surveyed
together. Return every member of `staff` whose `department` is either `sales`
or `support`. Three columns, in this order: `id`, `name`, `department`. Use
`IN` for the test. Any row order.

Run: `uv run dojo test 57_drills_where_1 ex4`

## Exercise 5 - everything outside a list

Edit `ex5/solution.sql`. Strategy wants the long tail: every customer whose
`country` is **not** one of our five largest markets - `US`, `GB`, `DE`, `FR`
or `CA`. Three columns, in this order: `id`, `name`, `country`. Any row
order.

Run: `uv run dojo test 57_drills_where_1 ex5`

## Exercise 6 - an inclusive range

Edit `ex6/solution.sql`. Pricing is studying the products clustered around
the catalog's average price. Return every product whose `price` is between
249 and 251, **inclusive on both ends**, using `BETWEEN`. Four columns, in
this order: `id`, `name`, `category`, `price`. Any row order.

Run: `uv run dojo test 57_drills_where_1 ex6`

## Exercise 7 - a list and a range together

Edit `ex7/solution.sql`. Compensation review is looking at the technical
middle of the company. Return every member of `staff` whose `department` is
`engineering` or `ops`, **and** whose `salary` is between 90000 and 100000
inclusive. Four columns, in this order: `id`, `name`, `department`, `salary`.
Any row order.

Run: `uv run dojo test 57_drills_where_1 ex7`

## Exercise 8 - excluding the middle

Edit `ex8/solution.sql`. The two ends of the toy and book ranges are being
re-photographed: the very cheap and the very expensive, nothing in between.
Return every product whose `category` is `toys` or `books`, and whose `price`
is **not** between 50 and 450 (that exclusion is inclusive of both bounds, so
a product at exactly 50.00 is excluded). Four columns, in this order: `id`,
`name`, `category`, `price`. Any row order.

Run: `uv run dojo test 57_drills_where_1 ex8`

## The gate

```python
"""Gates for 57_drills_where_1. Quoted verbatim in README.md."""
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


def test_ex7(shared_lesson_db):
    ex = L.exercise("ex7")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex8(shared_lesson_db):
    ex = L.exercise("ex8")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
```

Each gate runs the reference query and yours against the same clone and
compares the rows as an unordered multiset. No ordering is required anywhere
in this set, so a missing `ORDER BY` cannot fail you - a missing row can.

## The teaching point

A wrong `WHERE` clause does not raise an error. It returns a confident,
plausible, wrong answer, and the only defence is knowing exactly which rows
each operator lets through. Say the row count you expect out loud before you
run the query: being wrong is the information, and the size of the error
usually names the bug.

Next: **58_drills_where_2** - the same clause, with `AND`, `OR` and `NOT`.
