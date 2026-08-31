# 58 - Drills: AND, OR, NOT

Eight problems on boolean composition inside `WHERE` - lesson 02 again, this
time the half that causes real incidents. `AND` binds tighter than `OR`,
negation distributes in a way that surprises people, and neither mistake
produces an error message. Redo 02's concept section if that sentence is news.

## Exercise 1 - two conditions, both required

Edit `ex1/solution.sql`. The garden bargain bin wants cheap garden stock:
every product whose `category` is `garden` **and** whose `price` is under 20.
Three columns, in this order: `id`, `name`, `price`. Any row order.

Run: `uv run dojo test 58_drills_where_2 ex1`

## Exercise 2 - two conditions, either will do

Edit `ex2/solution.sql`. The all-hands invite list is everyone in
`engineering` **plus** anyone earning more than 200000, whatever their
department. Four columns, in this order: `id`, `name`, `department`,
`salary`. Any row order.

Run: `uv run dojo test 58_drills_where_2 ex2`

## Exercise 3 - negating one test

Edit `ex3/solution.sql`. Everyone except the sales organisation is being
moved to the new office. Return every member of `staff` whose `department` is
not `sales`. Three columns, in this order: `id`, `name`, `department`. Any
row order.

Run: `uv run dojo test 58_drills_where_2 ex3`

## Exercise 4 - the bracket that changes the question

Edit `ex4/solution.sql`. Support is chasing tiny orders that never got paid:
every order whose `status` is `shipped` **or** `cancelled`, **and** whose
`total` is under 15. Three columns, in this order: `id`, `status`, `total`.
Any row order.

Write the status test as an `OR` with explicit brackets, so the shape is in
your fingers.

Run: `uv run dojo test 58_drills_where_2 ex4`

## Exercise 5 - one category, two extremes

Edit `ex5/solution.sql`. The electronics buyer wants the outliers in her own
category: every product in `electronics` whose `price` is either under 10 or
over 490. Four columns, in this order: `id`, `name`, `category`, `price`. Any
row order.

Run: `uv run dojo test 58_drills_where_2 ex5`

## Exercise 6 - pushing NOT inside brackets

Edit `ex6/solution.sql`. The back-office teams are everyone who is not
customer-facing. Return every member of `staff` whose `department` is neither
`sales` nor `support`. Three columns, in this order: `id`, `name`,
`department`. Any row order.

Run: `uv run dojo test 58_drills_where_2 ex6`

## Exercise 7 - two branches, each with two conditions

Edit `ex7/solution.sql`. The clearance page takes two very different slices:
`toys` priced over 450, **plus** `books` priced under 30. Nothing else.
Four columns, in this order: `id`, `name`, `category`, `price`. Any row
order.

Run: `uv run dojo test 58_drills_where_2 ex7`

## Exercise 8 - negating a compound predicate

Edit `ex8/solution.sql`. The photo studio's backlog is defined by exclusion:
every product for which it is **not** the case that (the `category` is
`books` or `food`) **or** (the `price` is between 100 and 400 inclusive).
Four columns, in this order: `id`, `name`, `category`, `price`. Any row
order.

Run: `uv run dojo test 58_drills_where_2 ex8`

## The gate

```python
"""Gates for 58_drills_where_2. Quoted verbatim in README.md."""
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
compares the rows as an unordered multiset. A precedence bug almost never
returns *no* rows - it returns too many - so when a gate here fails, compare
the row counts in the message before you rewrite anything.

## The teaching point

Parenthesise every clause that mixes `AND` with `OR`, even when you are sure.
The brackets cost nothing and they are the only way a reviewer can tell "I
meant this" from "I forgot". The wrong reading almost always returns *more*
rows rather than an error, which is why this class of bug reaches production
and sits there.

Next: **59_drills_where_3** - pattern matching and mixed predicates.
