# 85 - Drills: subqueries 3

Eight problems on the two subquery jobs that lesson 13 introduced and that
real reporting leans on hardest: a **scalar subquery** standing in for a
single value, and a **correlated subquery** that is re-evaluated once per
outer row. Sets 83 and 84 drilled the filtering forms; this set puts
subqueries in the `SELECT` list, in `ORDER BY`, and inside grouped queries.

## Exercise 1 - measured against the boss

Every member of the `engineering` department, with the gap between the CEO's
salary and their own. The CEO is the one staff row whose `manager_id` is
`NULL`. Columns, in this order: `id`, `name`, `salary`, `below_ceo` = the
CEO's salary minus theirs, rounded to 2 decimal places.

**Ordered by `id` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 85_drills_subqueries_3 ex1`

## Exercise 2 - each category's share of the catalog

One row per product category: `category`, `products` = how many products it
holds, and `pct_of_catalog` = `round(100.0 * count(*) / <total products>, 2)`.
The total must come from a subquery over the whole `products` table, because
the outer query has already been split into groups by then.

**Ordered by `category` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 85_drills_subqueries_3 ex2`

## Exercise 3 - the manager's manager

For every member of the `support` department, return `id`, `name`, and
`grand_manager` = the `name` of their manager's manager. Staff who have no
such person - the CEO's direct reports, and the CEO - must still appear, with
`NULL` in that column.

**Ordered by `id` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 85_drills_subqueries_3 ex3`

## Exercise 4 - sorted by something you do not select

The `sales` department, listed busiest manager first. Return only `id`,
`name` and `salary` - the number of direct reports is the sort key, not an
output column.

**Ordered by the number of people that row directly manages, descending, then
by `id` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 85_drills_subqueries_3 ex4`

## Exercise 5 - every order of the busiest customer

Find the customer who has placed the most orders (if two are tied, the one
with the smaller `customer_id` wins) and return all of that customer's orders.
Columns, in this order: `id`, `customer_id`, `status`, `total`, `created_at`.

Do not hard-code the id you find - the gate runs against a database that may
be seeded at a different scale, where a different customer is busiest.

**Ordered by `id` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 85_drills_subqueries_3 ex5`

## Exercise 6 - better than the people who came before

Staff whose `salary` is strictly greater than the average salary of the
colleagues in their **own department** who were hired **strictly earlier**
than they were. Somebody with no earlier colleague in their department has no
average to beat and does not appear. Columns, in this order: `id`, `name`,
`department`, `salary`, `hired_on`.

**Ordered by `id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 85_drills_subqueries_3 ex6`

## Exercise 7 - above your own country's average

Count each customer's orders once, then report per country: `country`,
`buyers` = how many customers of that country have placed at least one order,
`avg_orders` = the average number of orders among them rounded to 2, and
`above_own_average` = how many of those customers placed more orders than
their own country's (unrounded) average.

Aggregate the 500,000-row `orders` table down to one row per customer first,
and correlate against that result rather than against `orders` itself.

**Ordered by `country` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 85_drills_subqueries_3 ex7`

## Exercise 8 - orders and first-timers, month by month

One row per calendar month in which orders exist. Return `month` =
`date_trunc('month', created_at)`, `orders` = how many orders that month, and
`new_customers` = how many customers placed their very **first** order in that
month.

A scalar subquery may not reference a column of the outer query that is not
in its `GROUP BY`, so name the month once and reuse it.

**Ordered by `month` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 85_drills_subqueries_3 ex8`

## The gate

```python
"""Gates for 85_drills_subqueries_3. Quoted verbatim in README.md."""
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
compares the rows **in order**. All eight prompts name an ordering, so a
correct result set in the wrong order still fails - and the failure message
says so explicitly rather than pretending the rows are wrong.

Next: **86_drills_exists_1**, on `EXISTS`, `NOT EXISTS`, and the `NULL` that
quietly empties a `NOT IN`.
