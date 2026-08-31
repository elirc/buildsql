# 79 - Drills: self-joins and hierarchies

Eight problems on one table joined to itself: employee and manager, teammate
and teammate, and the shapes that fall out of an inequality in an `ON`
clause. This set drills lesson 10, and everything here runs against `staff`,
by far the smallest table in the dataset - so these are fast to iterate on
and there is nowhere to hide.

## Exercise 1

Everyone in the `support` department, with the name of the person they report
to. Columns, in this order: the employee's `id`, `name`, `salary`, and
`manager` (the manager's name).

**Ordered by the employee's `id` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 79_drills_self_joins_1 ex1`

## Exercise 2

Teammate pairs in the `engineering` department - two people who report to the
same manager. Each pair appears exactly once, with the lower `id` first, and
nobody is paired with themselves. Columns, in this order: `id`, `name`,
`id2`, `name2`.

**Ordered by `id` ascending, then `id2` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 79_drills_self_joins_1 ex2`

## Exercise 3

Every row of `staff`, with the name of their manager and how far their own
salary sits above or below their manager's. The one person who has no
manager still appears, with NULL in both of those columns. Columns, in this
order: `id`, `name`, `manager`, `gap` (the employee's salary minus the
manager's).

**Ordered by `id` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 79_drills_self_joins_1 ex3`

## Exercise 4

Everyone whose department differs from their manager's. Columns, in this
order: the employee's `id`, `name`, `department`, then `manager` (the
manager's name) and `manager_department`.

**Ordered by the employee's `id` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 79_drills_self_joins_1 ex4`

## Exercise 5

For every person in the `sales` department, how many people **in the same
department** earn strictly more than they do. The top earner must appear with
`0`. Columns, in this order: `id`, `name`, `richer_colleagues`.

**Ordered by `id` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 79_drills_self_joins_1 ex5`

## Exercise 6

Every manager with **at least 5 direct reports**: their own id, name and
department, how many direct reports they have, and the average salary of
those reports rounded to 2 decimal places. Columns, in this order: `id`,
`name`, `department`, `reports`, `avg_report_salary`.

**Ordered by `reports` descending, then `id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 79_drills_self_joins_1 ex6`

## Exercise 7

Pairs of people who report to the same manager where the second was hired
**at least 1825 days** (five years) after the first. Columns, in this order:
`id`, `name` (the earlier hire), `id2`, `name2` (the later hire), and
`days_apart` - a plain integer count of days.

**Ordered by `id` ascending, then `id2` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 79_drills_self_joins_1 ex7`

## Exercise 8

Every person who manages at least one other person: their id, their name, how
many direct reports they have, and the name of their **highest-paid** direct
report - ties broken by the lower staff `id`. Columns, in this order: `id`,
`name`, `reports`, `top_report`.

**Ordered by `id` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 79_drills_self_joins_1 ex8`

## The gate

```python
"""Gates for 79_drills_self_joins_1. Quoted verbatim in README.md."""
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
compares the rows **in order**. Two failure signatures are worth recognising
here: exactly twice the expected rows means your pair join is symmetric and
needs an inequality, and one row short of the whole table means an inner
join ate the CEO.

Next: **`80_drills_set_ops_1`**.
