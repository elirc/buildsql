# 65 - Drills: NULL logic, set 1

These eight problems drill three-valued logic - lesson 05, with a little of
04's `coalesce` and `concat` - on the one column in this database that is
naturally NULL, `staff.manager_id`, plus a few NULLs you will manufacture
yourself. If any of them feels like guessing, reread 05 before you continue:
NULL is the one topic where a wrong mental model produces queries that run
happily and answer the wrong question.

## Exercise 1 - is there a manager or not

For every staff member with `id` of 20 or less, return the columns `id`,
`name`, `manager_id`, and a fourth column `has_manager` holding the boolean
result of testing whether `manager_id` is not null.

**Ordered by `id` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 65_drills_null_1 ex1`

## Exercise 2 - coalesce, and the type trap inside it

For every staff member in the `ops` department, return `id`, `name`, and a
column `manager` containing the `manager_id` rendered as text, or the string
`'none'` where there is no manager.

**Ordered by `id` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 65_drills_null_1 ex2`

## Exercise 3 - the pipe operator versus concat

For every staff member with `id` of 12 or less, return three columns: `id`,
then `piped` built as `name || ' -> ' || manager_id`, then `joined` built as
`concat(name, ' -> ', manager_id)`.

One of those two columns is NULL for the CEO and the other is not. Write
both exactly as described and see which.

**Ordered by `id` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 65_drills_null_1 ex3`

## Exercise 4 - where NULLs sort

Return `id`, `name` and `manager_id` for every staff member, sorted by
`manager_id` **descending with NULLs last**, and then by `id` ascending.

**Ordered exactly as described** - this gate compares row order.

Edit `ex4/solution.sql`. Run: `uv run dojo test 65_drills_null_1 ex4`

## Exercise 5 - aggregating nothing at all

`orders.status` never contains the value `'refunded'`, so this query has no
rows to work with. Return one row with four columns computed over
`orders` restricted to `status = 'refunded'`: `n` = `count(*)`,
`revenue` = `sum(total)`, `revenue_or_zero` = the same sum with NULL
replaced by `0`, and `newest` = `max(created_at)`.

Ordering does not matter - it is a single row.

Edit `ex5/solution.sql`. Run: `uv run dojo test 65_drills_null_1 ex5`

## Exercise 6 - DISTINCT thinks NULLs are equal

Return the distinct values of `manager_id` in `staff` - one column, named
`manager_id`.

**Ordered by `manager_id` ascending**, leaving PostgreSQL's default NULL
placement alone.

Edit `ex6/solution.sql`. Run: `uv run dojo test 65_drills_null_1 ex6`

## Exercise 7 - NOT IN, and the empty answer

Return `id` and `name` for every staff member who is **not** the manager of
anybody in the `ops` department.

Build the excluded set from the `manager_id` values of `ops` staff. That set
contains a NULL, and a naive `NOT IN` against it returns no rows at all - the
whole point of this drill is to write the version that does not.

**Ordered by `id` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 65_drills_null_1 ex7`

## Exercise 8 - the rows a WHERE clause throws away

Return `id`, `name`, `manager_id` and `salary` for every staff row where the
condition

```
manager_id > 5 AND salary > 100000
```

is **not true** - that is, every row a `WHERE` clause carrying that condition
would reject, including the rows where it evaluates to unknown rather than
false.

**Ordered by `id` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 65_drills_null_1 ex8`

## The gate

```python
"""Gates for 65_drills_null_1. Quoted verbatim in README.md."""
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
    grader.assert_rows_equal(actual, expected, ordered=False)


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

Every gate here runs `expected.sql` and your `solution.sql` against the same
clone and compares the rows. Where the prompt names an ordering the
comparison is order-sensitive (`ordered=True`), and a failure will say
"RIGHT ROWS, WRONG ORDER" rather than dumping a diff at you.

Next: **66_drills_null_2**, which takes the same ideas into aggregates,
groups and joins - where NULLs stop being a filtering curiosity and start
changing your numbers.
