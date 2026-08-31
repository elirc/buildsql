# 55 - Drills: the SELECT list

These eight problems drill the SELECT list - lesson 01 - and nothing else:
which columns come back, in which order, what you can compute on the way out,
and what `DISTINCT` really de-duplicates. If any of them feels like guessing,
redo 01 before you continue.

## Exercise 1 - columns, in the order asked for

Edit `ex1/solution.sql`. The catalog export wants every product, but not in
the order the table happens to store them. Return exactly three columns, in
this order: `category`, `id`, `price`. Every product row, any row order.

Run: `uv run dojo test 55_drills_select_1 ex1`

## Exercise 2 - a column that is not in the table

Edit `ex2/solution.sql`. Payroll's importer needs a currency marker on every
row, and `staff` does not have one. Return four columns, in this order: `id`,
`name`, `salary`, and a fourth column whose value is the text `USD` on every
row. All staff, any row order.

Run: `uv run dojo test 55_drills_select_1 ex2`

## Exercise 3 - dividing a salary

Edit `ex3/solution.sql`. The benefits team quotes pay monthly. Return three
columns, in this order: `id`, `salary`, and `salary` divided by 12. Do not
round it - hand back whatever the division gives you. All staff, any row
order.

Run: `uv run dojo test 55_drills_select_1 ex3`

## Exercise 4 - the values a column actually takes

Edit `ex4/solution.sql`. Before writing a bulk-discount rule, ops wants to
know which order quantities ever occur. Return one column - the distinct
values of `order_items.quantity` - with no duplicates. Any row order.

Run: `uv run dojo test 55_drills_select_1 ex4`

## Exercise 5 - distinct pairs, NULL included

Edit `ex5/solution.sql`. The org-chart tool wants every combination of
department and manager that occurs in `staff`. Return two columns, in this
order: `department` and `manager_id`, with duplicate pairs removed. One
member of staff has no manager; that pair belongs in the output too. Any row
order.

Run: `uv run dojo test 55_drills_select_1 ex5`

## Exercise 6 - two derived columns from one

Edit `ex6/solution.sql`. Finance wants a VAT worksheet. Return four columns,
in this order: `id`, `price`, the VAT amount at 20 percent (`price * 0.2`),
and the gross price (`price * 1.2`). Do not round either figure. Every
product, any row order.

Run: `uv run dojo test 55_drills_select_1 ex6`

## Exercise 7 - the division that throws away the remainder

Edit `ex7/solution.sql`. A colleague reports that "half the ratings come out
as zero" in a report that halves `reviews.rating`. Return the distinct
combinations of three columns, in this order: `rating`, `rating / 2`, and
`rating / 2.0`. Duplicates removed; any row order.

Run: `uv run dojo test 55_drills_select_1 ex7`

## Exercise 8 - bucketing with modulo

Edit `ex8/solution.sql`. Merchandising wants to know which 100-dollar price
bands each category actually occupies. Return the distinct combinations of
two columns, in this order: `category`, and the band computed as
`price - price % 100`. Duplicates removed; any row order.

The band for a 137.53 product is `100.00`; for a 54.46 product it is `0.00`.

Run: `uv run dojo test 55_drills_select_1 ex8`

## The gate

```python
"""Gates for 55_drills_select_1. Quoted verbatim in README.md."""
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

Every gate here runs the reference query and yours against the same clone and
compares the rows as an unordered multiset: the values and the column order
must match, the row order does not. Column *names* are never checked, so an
alias is for the human reading your query, not for the gate.

## The teaching point

The SELECT list is the only clause that can invent data. Everything else in a
query narrows, joins, or sorts rows that already exist; the SELECT list is
where a price becomes a price-with-tax and a salary becomes a monthly figure.
Getting fluent here is what stops you from pulling raw columns into
application code and recomputing the same arithmetic in three services.

Next: **56_drills_select_2** - the same skill, under more pressure.
