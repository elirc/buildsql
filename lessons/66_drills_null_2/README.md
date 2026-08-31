# 66 - Drills: NULL logic, set 2

Set 1 kept NULLs inside a single row. These eight take them into aggregates,
`GROUP BY` and outer joins - lesson 05 crossed with 06, 07 and 09 - which is
where a missing value stops being a display problem and starts changing your
totals. Every problem here has a number in it that comes out differently
depending on whether you counted the NULLs or skipped them.

## Exercise 1 - count(*) is not count(column)

For each `staff` department, return `department`, `headcount` = the number of
staff rows in it, and `with_manager` = the number of those rows whose
`manager_id` is present.

**Ordered by `department` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 66_drills_null_2 ex1`

## Exercise 2 - a NULL group nobody asked for

Group `orders` by `nullif(status, 'cancelled')` - an expression that turns
the cancelled orders into a NULL group and leaves the rest alone. Return
`live_status` (that expression), `orders` = the number of rows in the group,
and `revenue` = `sum(total)`.

**Ordered by `live_status` ascending with NULLs first.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 66_drills_null_2 ex2`

## Exercise 3 - NULL-safe equality

Return `id`, `name` and `manager_id` for every staff member whose
`manager_id` is **not distinct from** the `manager_id` of staff member 1 -
that is, matches it under a comparison where NULL equals NULL.

Get the value to compare against with a scalar subquery on `staff`.

**Ordered by `id` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 66_drills_null_2 ex3`

## Exercise 4 - dividing by a count that might be zero

For each `staff` department return `department`, `headcount` = `count(*)`,
`principals` = the number of staff earning 190000 or more, and
`staff_per_principal` = `headcount` divided by `principals`, computed as
numeric and rounded to 2 decimal places.

Several departments have no principals at all. That row's ratio must come
back as NULL rather than raising a division-by-zero error.

**Ordered by `department` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 66_drills_null_2 ex4`

## Exercise 5 - counting what did not match

For each product category, how many of its products have never appeared in
any `order_items` row? Return `category` and `never_ordered`.

Write this as an outer join from `products` to `order_items` and keep the
rows where the join found nothing.

**Ordered by `category` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 66_drills_null_2 ex5`

## Exercise 6 - sum of nothing, defaulted to zero

For every staff member earning less than 100000, return `id`, `name`,
`reports` = the number of people who report directly to them (0 when nobody
does), and `report_payroll` = the total salary of those direct reports,
reported as `0` rather than NULL when there are none.

Most of these people manage nobody, so most rows are the interesting case.

**Ordered by `id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 66_drills_null_2 ex6`

## Exercise 7 - HAVING on the gap between two counts

Which departments contain at least one staff member with no manager? Return
`department`, `headcount` = `count(*)`, and `rootless` = how many of them
have a NULL `manager_id` - keeping only the departments where `rootless` is
at least 1.

Express the HAVING condition as a comparison between two counts rather than
by filtering rows in `WHERE`.

**Ordered by `department` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 66_drills_null_2 ex7`

## Exercise 8 - average of nothing versus average of zeros

For every product in the `books` category, return `id`, `name`,
`recent_5star` = the number of 5-star reviews it received on or after
2023-11-01, `avg_recent` = the average of those ratings rounded to 2, and
`avg_zero_filled` = the average of `coalesce(rating, 0)` over the same outer
join, also rounded to 2.

Join with `LEFT JOIN reviews` and put both the rating test and the date test
in the `ON` clause, so that products with no qualifying review still appear.
Most books have none, and those rows are where the two averages disagree.

**Ordered by `id` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 66_drills_null_2 ex8`

## The gate

```python
"""Gates for 66_drills_null_2. Quoted verbatim in README.md."""
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
compares rows; the prompts that name an ordering are graded with
`ordered=True`. Nothing here checks your plan or your style, only the rows -
so if a count is off by exactly the number of NULL rows, you have found the
bug the drill was aiming at.

Next: **67_drills_aggregates_1**, where counting and summing get a lesson of
their own - three sets of them, in fact.
