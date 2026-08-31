# 70 - Drills: GROUP BY and HAVING, set 1

Eight problems on lesson 07: one row per group, the rule that every selected
column is either grouped or aggregated, and the split between `WHERE` (which
filters rows before grouping) and `HAVING` (which filters groups after it).
If the phrase "column must appear in the GROUP BY clause or be used in an
aggregate function" is still a mystery when PostgreSQL says it, reread 07
before starting.

## Exercise 1 - customers per country

For each country in `customers`, return `country`, `customers` = the number
of rows in that country, and `first_signup` = the earliest `created_at`
there.

**Ordered by `country` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 70_drills_group_having_1 ex1`

## Exercise 2 - filter the rows, then group them

Consider only the reviews rated 4 or 5. For each of those two ratings,
return `rating`, `reviews` = how many there are, and `products` = the number
of distinct products they cover.

**Ordered by `rating` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 70_drills_group_having_1 ex2`

## Exercise 3 - the department table

For each `staff` department, return `department`, `headcount` = the number of
staff, `avg_salary` = the average salary rounded to 2, and `top_salary` = the
highest salary in that department.

**Ordered by `department` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 70_drills_group_having_1 ex3`

## Exercise 4 - HAVING on an average

Which product categories have an average price above 250? Return `category`,
`products` = the number of products in it, and `avg_price` = the average
price rounded to 2, keeping only the categories whose average price exceeds
250.

Compare the unrounded average in your condition, not the rounded column.

**Ordered by `category` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 70_drills_group_having_1 ex4`

## Exercise 5 - WHERE and HAVING in one query

Among orders created on or after 2023-01-01, find the customers who placed
more than 15 of them. Return `customer_id`, `orders` = how many such orders
they placed, and `revenue` = the sum of those totals rounded to 2.

**Ordered by `customer_id` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 70_drills_group_having_1 ex5`

## Exercise 6 - grouping by a computed value

Bucket the products into hundreds by price. Group by the expression
`floor(price / 100) * 100` and return `price_floor` (that expression),
`products` = how many fall in the bucket, and `avg_price` = their average
price rounded to 2.

Write the expression exactly as given so the bucket labels match.

**Ordered by `price_floor` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 70_drills_group_having_1 ex6`

## Exercise 7 - the biggest groups first

The five countries with the most customers. Return `country` and `customers`
= the number of customers there, ordered by `customers` descending, and by
`country` ascending where two countries tie, limited to five rows.

**Ordered exactly as described** - the tie-break matters.

Edit `ex7/solution.sql`. Run: `uv run dojo test 70_drills_group_having_1 ex7`

## Exercise 8 - HAVING on a distinct count

Which customers ordered in at least 11 distinct calendar months? Return
`customer_id`, `orders` = their total number of orders, and `active_months` =
the number of distinct values of `date_trunc('month', created_at)` among
their orders - keeping only customers whose `active_months` is 11 or more.

**Ordered by `customer_id` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 70_drills_group_having_1 ex8`

## The gate

```python
"""Gates for 70_drills_group_having_1. Quoted verbatim in README.md."""
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
compares rows. Each of these prompts names an ordering, so all eight are
graded with `ordered=True` - grouped results come out in whatever order the
aggregation happened to produce unless you sort them, which is why every
report query ends in an `ORDER BY`.

Next: **71_drills_group_having_2**, on grouping by expressions rather than by
plain columns.
