# 89 - Drills: recursive CTEs

Eight problems on `WITH RECURSIVE`, from lesson 14. Seven of them walk the
`staff` org chart - 500 people, one CEO with a `NULL` `manager_id`, four levels
deep - and one generates a series out of thin air, because that is the other
half of what recursion is for. Get the anchor and the step straight and the
rest is arithmetic.

## Exercise 1 - how wide is each level

Count the staff at each level of the org chart. Start from the CEO at
`depth = 1` and add one per hop. Columns, in this order: `depth`, `staff` =
how many people sit at that depth.

**Ordered by `depth` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 89_drills_recursion_1 ex1`

## Exercise 2 - the chain above the lowest-paid person

Find the single lowest-paid member of staff (ties broken by the smaller `id`)
and walk **upwards** to the CEO. Columns, in this order: `pos` - 1 for the
person themselves, 2 for their manager, and so on - then `id`, `name`,
`department`.

Do not hard-code the id: pick it with a subquery so the query still works at
another seed scale.

**Ordered by `pos` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 89_drills_recursion_1 ex2`

## Exercise 3 - a calendar with no table behind it

Generate every month from the month of the earliest order to the month of the
latest, using a recursive CTE, then count the orders in each. Columns, in this
order: `month` = a `date_trunc('month', ...)` timestamp, `orders`.

The anchor row is `date_trunc('month', min(created_at))`; each step adds
`INTERVAL '1 month'` and stops once it passes
`date_trunc('month', max(created_at))`. Join `orders` onto the generated
months with a `LEFT JOIN` so an empty month would still appear.

**Ordered by `month` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 89_drills_recursion_1 ex3`

## Exercise 4 - everybody's full chain of command

For every member of staff, the path of names from the CEO down to them, joined
with `' > '` - so the CEO's own path is just their name, and a level-2 person
reads `Karen Welch > Ryan Ferguson`. Columns, in this order: `id`, `name`,
`depth` (CEO = 1), `path`.

Accumulate the string as you descend.

**Ordered by `id` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 89_drills_recursion_1 ex4`

## Exercise 5 - depth and leaves per department

For each department, how deep its people go and how many of them manage
nobody. Columns, in this order: `department`, `max_depth` = the largest depth
reached by anyone in that department (CEO = 1), `leaves` = how many people in
that department have no direct reports.

**Ordered by `department` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 89_drills_recursion_1 ex5`

## Exercise 6 - how many people are under you, at any depth

For every member of staff who has at least one descendant, how many people sit
somewhere below them in the tree - direct reports, their reports, and so on.
Columns, in this order: `id`, `name`, `descendants`.

The trick is to carry the starting row's id through the recursion so that
every reachable person is tagged with the root they were reached from.

**Ordered by `descendants` descending, then `id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 89_drills_recursion_1 ex6`

## Exercise 7 - who is your division head

The CEO's direct reports are the division heads. For every member of staff
below the CEO, return their own row plus the head of the division they belong
to - a division head is their own head, with a ratio of exactly 1.000. The CEO
themselves does not appear.

Columns, in this order: `id`, `name`, `head_name`, `salary_ratio` =
`round(salary / <head's salary>, 3)`.

**Ordered by `id` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 89_drills_recursion_1 ex7`

## Exercise 8 - the expensive subtrees

Every member of staff whose subtree - themselves plus everyone below them -
accounts for at least 5% of the company's total payroll. Columns, in this
order: `id`, `name`, `department`, `subtree_staff` = how many people including
themselves, `subtree_payroll` = the summed salary rounded to 2, and
`pct_of_payroll` = `round(100 * subtree_payroll / <company payroll>, 2)`.

Compare against the unrounded payroll figures.

**Ordered by `pct_of_payroll` descending, then `id` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 89_drills_recursion_1 ex8`

## The gate

```python
"""Gates for 89_drills_recursion_1. Quoted verbatim in README.md."""
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
compares the rows **in order**. If one of these hangs instead of failing, the
recursion is not terminating - the step is not making progress towards the
anchor - and `Ctrl-C` followed by a hard look at the join condition is the
usual cure.

Next: **90_drills_windows_1**, on `ROW_NUMBER`, `RANK` and `DENSE_RANK`.
