# 88 - Drills: common table expressions, set 2

Eight refactoring problems. Each one has a spelling without `WITH` - a
correlated subquery, a repeated aggregate, a window function - and the point
of the set is to write the named-steps version and then read the reference to
see the other one. Lesson 14 is the source; set 87 covered the basic shapes.

## Exercise 1 - a correlated subquery, unrolled

`books` and `electronics` products priced above the average price of their own
category. Compute the six category averages once in a CTE and join to it,
instead of asking for the average again inside every row's `WHERE`. Columns,
in this order: `id`, `name`, `category`, `price`.

The averages are taken over the whole category, not just over the two
categories you return.

**Ordered by `category` ascending, then `id` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 88_drills_ctes_2 ex1`

## Exercise 2 - the constant that must not be recomputed

Average order total per status, next to how far that sits from the average
across all orders. Put the overall average in a one-row CTE and bring it in
with `CROSS JOIN`. Columns, in this order: `status`, `avg_total` = the group's
average rounded to 2, and `vs_overall` = the group's average minus the overall
average, rounded to 2.

A cross-joined column is not a grouping key, so wrap it in an aggregate such
as `min(...)` to use it beside `GROUP BY status`.

**Ordered by `status` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 88_drills_ctes_2 ex2`

## Exercise 3 - aggregate, enrich, aggregate

Order behaviour per country, in three named steps: orders per customer; that
result joined to `customers` for the country; then the per-country summary.
Columns, in this order: `country`, `buyers` = customers with at least one
order, `avg_orders` rounded to 2, `max_orders`.

**Ordered by `country` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 88_drills_ctes_2 ex3`

## Exercise 4 - two named sets, one difference

Products that have been reviewed but have never been ordered. Build a CTE of
the distinct reviewed `product_id`s and a CTE of the distinct sold ones, then
subtract the second from the first with `EXCEPT`. Single column: `product_id`.

**Ordered by `product_id` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 88_drills_ctes_2 ex4`

## Exercise 5 - last month, without a window function

Monthly order counts alongside the previous month's count, obtained by joining
one CTE to itself on a shifted month. Columns, in this order: `month` =
`date_trunc('month', created_at)`, `orders`, `prev_orders` - `NULL` for the
first month, so the join must be a `LEFT JOIN`.

Shift with `cur.month - INTERVAL '1 month'`.

**Ordered by `month` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 88_drills_ctes_2 ex5`

## Exercise 6 - a CTE made of literals

Count products in three price bands. Write the bands as a `VALUES` CTE with
the column names `tier`, `lo`, `hi` and the rows `('budget', 0, 100)`,
`('mid', 100, 300)`, `('premium', 300, 500)`, then `LEFT JOIN` products onto
it with `p.price >= t.lo AND p.price < t.hi`. Columns, in this order: `tier`,
`lo`, `products` = `count(p.id)`.

**Ordered by `lo` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 88_drills_ctes_2 ex6`

## Exercise 7 - one CTE, two consumers

A department payroll report. Compute the company totals once (`sum(salary)`
and `avg(salary)`), then use that same CTE twice: once to work out how many
people in each department earn above the **company** average, and once to
express each department's payroll as a share of the company's. Columns, in
this order: `department`, `headcount`, `payroll` rounded to 2,
`pct_of_payroll` = `round(100 * payroll / <company payroll>, 2)`, and
`above_company_avg` - which must be `0`, not `NULL`, for a department where
nobody clears the bar.

**Ordered by `department` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 88_drills_ctes_2 ex7`

## Exercise 8 - a four-step pipeline

Category performance for orders created on or after 2023-09-01. Build it as a
chain: the qualifying orders; their order items turned into
`quantity * price` line revenue; those lines joined to `products` for the
category; and finally the summary. Columns, in this order: `category`,
`revenue` = the summed line revenue rounded to 2, `buyers` =
`count(DISTINCT customer_id)`, and `revenue_per_buyer` = revenue divided by
buyers, rounded to 2.

Round only at the end - `revenue_per_buyer` divides the unrounded sum.

**Ordered by `revenue` descending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 88_drills_ctes_2 ex8`

## The gate

```python
"""Gates for 88_drills_ctes_2. Quoted verbatim in README.md."""
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
compares the rows **in order**. Each reference here is deliberately the
*other* spelling - a window function, a scalar subquery, a plain join - so
reading them after you pass is half the exercise.

Next: **89_drills_recursion_1**, on `WITH RECURSIVE` and the org chart.
