# 62 - Drills: numbers, rounding, and casts

Eight problems on the numeric half of lesson 04: `round` with a positive and
a negative scale, `trunc`, `floor`, `ceil`, casts, and the division that
throws the remainder away. Redo 04's concept section if the second argument
of `round` is unfamiliar.

## Exercise 1 - to the nearest dollar

Edit `ex1/solution.sql`. The shelf-edge labels have no room for cents. Return
three columns, in this order: `id`, `price`, and `price` rounded to the
nearest whole number. Every product, any row order.

Run: `uv run dojo test 62_drills_expressions_1 ex1`

## Exercise 2 - monthly pay, to the cent

Edit `ex2/solution.sql`. The offer letters quote a monthly figure to two
decimal places. Return three columns, in this order: `id`, `name`, and
`salary / 12` rounded to **2** decimal places. All staff, any row order.

Run: `uv run dojo test 62_drills_expressions_1 ex2`

## Exercise 3 - rounding left of the point

Edit `ex3/solution.sql`. A price-distribution chart needs two coarser views
of every price. Return four columns, in this order: `id`, `price`, `price`
rounded to the nearest **ten**, and `price` rounded to the nearest
**hundred**. Every product, any row order.

Run: `uv run dojo test 62_drills_expressions_1 ex3`

## Exercise 4 - cutting versus casting

Edit `ex4/solution.sql`. Two different exporters disagree about how to drop
the cents, and pricing wants both answers side by side. Return four columns,
in this order: `id`, `price`, `trunc(price)`, and `price::int`. Every
product, any row order.

Run: `uv run dojo test 62_drills_expressions_1 ex4`

## Exercise 5 - down and up

Edit `ex5/solution.sql`. Warehouse packing needs the dollar floor and the
dollar ceiling of every price. Return four columns, in this order: `id`,
`price`, `floor(price)`, and `ceil(price)`. Every product, any row order.

Run: `uv run dojo test 62_drills_expressions_1 ex5`

## Exercise 6 - how far from the band

Edit `ex6/solution.sql`. Compensation bands are thousands of dollars wide,
and HR wants to see how far each salary sits from its band. Return four
columns, in this order: `id`, `salary`, `salary` rounded to the nearest
**thousand**, and the difference `salary - round(salary, -3)`. That
difference is negative for anyone below their band's midpoint - leave it
negative. All staff, any row order.

Run: `uv run dojo test 62_drills_expressions_1 ex6`

## Exercise 7 - rounded and raw, side by side

Edit `ex7/solution.sql`. A twenty-percent-off sale is being reviewed and
finance wants to see what rounding actually changes. Return four columns, in
this order: `id`, `price`, `round(price * 0.8, 2)`, and the unrounded
`price * 0.8`. Write both expressions exactly as given. Every product, any
row order.

Run: `uv run dojo test 62_drills_expressions_1 ex7`

## Exercise 8 - three ways to divide by three

Edit `ex8/solution.sql`. A three-for-the-price-of-one calculator produced
different numbers in three services, and the whole point of this exercise is
to see why. Return five columns, in this order: `id`, `price`, `price::int`,
`price::int / 3`, and `round(price / 3, 2)`. Write each expression exactly as
given. Every product, any row order.

Run: `uv run dojo test 62_drills_expressions_1 ex8`

## The gate

```python
"""Gates for 62_drills_expressions_1. Quoted verbatim in README.md."""
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
compares the rows as an unordered multiset. Values are compared, not types -
so `290` and `290.00` count as equal, and a wrong rounding rule is what
actually fails you here.

## The teaching point

Every rounding rule in a system is a business decision that someone has to
own. Rounding at the wrong step - per line rather than per invoice, or twice
because two services both did it - is one of the classic sources of a
one-cent discrepancy that takes a week to find. Compute in full precision and
round once, at the boundary where the number becomes an answer.

Next: **63_drills_expressions_2** - the same clause applied to text.
