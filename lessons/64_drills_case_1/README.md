# 64 - Drills: CASE

Eight problems on lesson 04's workhorse: `CASE`, SQL's per-row if/else.
Branch order, the missing `ELSE`, both syntactic forms, and what happens when
one `CASE` lives inside another. Redo 04's concept section if "stops at the
first true WHEN" is not already reflex.

## Exercise 1 - two branches

Edit `ex1/solution.sql`. Merchandising splits the catalog in two: a product
priced at 400 or more is `premium`, everything else is `standard`. Return
three columns, in this order: `id`, `price`, and the label. Every product,
any row order.

Run: `uv run dojo test 64_drills_case_1 ex1`

## Exercise 2 - the simple form

Edit `ex2/solution.sql`. Facilities splits staff by desk type: `sales` and
`support` are `field`, everyone else is `office`. Write it with the **simple**
`CASE` form - `CASE department WHEN ... THEN ... END` - rather than the
searched form. Return three columns, in this order: `id`, `name`, and the
desk type. All staff, any row order.

Run: `uv run dojo test 64_drills_case_1 ex2`

## Exercise 3 - no ELSE on purpose

Edit `ex3/solution.sql`. The content team only has editorial groupings for
two categories: `books` are `media` and `electronics` are `tech`. Every other
category must come back as **NULL** - do not invent a label for it, and do
not write an `ELSE`.

Return three columns, in this order: `id`, `category`, and the grouping.
Every product, any row order.

Run: `uv run dojo test 64_drills_case_1 ex3`

## Exercise 4 - branch order decides everything

Edit `ex4/solution.sql`. Compensation bands, checked from the top down: over
100000 is `senior`, over 60000 is `mid`, anything else is `junior`. Both
thresholds are strict. Return three columns, in this order: `id`, `salary`,
and the band. All staff, any row order.

Run: `uv run dojo test 64_drills_case_1 ex4`

## Exercise 5 - a CASE that returns a number

Edit `ex5/solution.sql`. Food products get five percent off; everything else
keeps its price. Return three columns, in this order: `id`, `price`, and the
selling price - `round(price * 0.95, 2)` for `food`, and the plain `price`
for every other category. Every product, any row order.

Run: `uv run dojo test 64_drills_case_1 ex5`

## Exercise 6 - a CASE over a NULL

Edit `ex6/solution.sql`. The org-chart export labels each person's reporting
line: the one person with no manager gets the text `CEO`, and everyone else
gets `reports to ` followed by their `manager_id`. For manager 7 that is
exactly `reports to 7`.

Return three columns, in this order: `id`, `name`, and the label. All staff,
any row order.

Run: `uv run dojo test 64_drills_case_1 ex6`

## Exercise 7 - two ladders in one row

Edit `ex7/solution.sql`. The pricing dashboard wants two independent
classifications on every product row. Return five columns, in this order:

| position | value |
|---|---|
| 1 | `id` |
| 2 | `category` |
| 3 | `price` |
| 4 | price band: `A` under 100, `B` under 200, `C` under 300, `D` under 400, `E` otherwise |
| 5 | department: `hard` for `electronics` and `garden`, `soft` for `clothing` and `toys`, `consumable` for `books` and `food` |

All thresholds in column 4 are strict. Every product, any row order.

Run: `uv run dojo test 64_drills_case_1 ex7`

## Exercise 8 - a CASE inside a CASE

Edit `ex8/solution.sql`. The merchandising matrix depends on the category
first and the price second:

- for `electronics` and `toys`: `hero` if `price` is 250 or more, otherwise
  `volume`
- for every other category: `premium-other` if `price` is 250 or more,
  otherwise `other`

Return four columns, in this order: `id`, `category`, `price`, and the
matrix label. Every product, any row order.

Run: `uv run dojo test 64_drills_case_1 ex8`

## The gate

```python
"""Gates for 64_drills_case_1. Quoted verbatim in README.md."""
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
compares the rows as an unordered multiset. NULL is a value in that
comparison, so an exercise whose `CASE` deliberately has no `ELSE` is graded
on getting the NULLs in exactly the right rows.

## The teaching point

A `CASE` ladder is a business rule written down, and the two things that make
it wrong in production are both invisible at review time: the branches are in
the wrong order, so a later condition can never fire, or there is no `ELSE`
and the rows nobody thought about come back NULL. Read a ladder top to bottom
and ask what reaches each branch. Then ask what reaches none of them.

Next: **65_drills_null_1** - the three-valued logic that gives the missing
`ELSE` its teeth.
