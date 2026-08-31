# 106 - Drills: LATERAL joins, set 1

Eight problems on lesson 48: a subquery in FROM that can see the rows to its
left, runs once per driving row, and - the killer feature - carries a LIMIT
that applies per group instead of per query. If `CROSS JOIN LATERAL` versus
`LEFT JOIN LATERAL ... ON true` is not yet automatic, reread lesson 48 first.

## Exercise 1 - the three newest hires per department

For every `staff` department, return its three most recently hired people:
`department`, `name`, `hired_on`. Break `hired_on` ties by `id` ascending.

**Ordered by `department` ascending, then `hired_on` descending, then `id`
ascending.** (15 rows.)

Edit `ex1/solution.sql`. Run: `uv run dojo test 106_drills_lateral_1 ex1`

## Exercise 2 - each customer's priciest order

For every customer with `id <= 15`, their single most expensive order:
`customer_id`, `order_id`, `total`. Break `total` ties by the order's `id`
ascending. A customer with no orders should not appear - the plain `CROSS
JOIN LATERAL` gives you that for free.

**Ordered by `customer_id` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 106_drills_lateral_1 ex2`

## Exercise 3 - the latest review, keeping the reviewless

For every product with `id <= 12`: `id`, `name`, and the product's most
recent review as `review_id` and `rating` (ties on `created_at` broken by
the review's `id`, higher id wins). Products with no reviews must still
appear, with NULLs in the review columns.

**Ordered by `id` ascending.** (12 rows.)

Edit `ex3/solution.sql`. Run: `uv run dojo test 106_drills_lateral_1 ex3`

## Exercise 4 - the top-three payroll

For every department: `department` and `top3_payroll` = the sum of its three
highest salaries (ties broken by `id`). Pick the three first, then sum -
that ordering of steps is the whole exercise.

**Ordered by `department` ascending.** (5 rows.)

Edit `ex4/solution.sql`. Run: `uv run dojo test 106_drills_lateral_1 ex4`

## Exercise 5 - the three freshest reviews of each rating

For each of the five ratings (drive the lateral from `SELECT DISTINCT
rating`, not a hand-typed list), the three most recent reviews carrying it:
`rating`, `review_id`, `created_at`. Break `created_at` ties by the
review's `id`, higher id wins.

**Ordered by `rating` ascending, then `created_at` descending, then
`review_id` descending.** (15 rows.)

Edit `ex5/solution.sql`. Run: `uv run dojo test 106_drills_lateral_1 ex5`

## Exercise 6 - the last three events of each early customer

For every customer with `id <= 5`, their three most recent events from the
three-million-row stream: `customer_id`, `event_type`, `ts`. (Event
timestamps never tie - they increase strictly with `id`.)

**Ordered by `customer_id` ascending, then `ts` descending.** (15 rows.)

Edit `ex6/solution.sql`. Run: `uv run dojo test 106_drills_lateral_1 ex6`

## Exercise 7 - the quarter's bestsellers, per category

For every product category, the three products with the most units sold in
orders created on or after `2023-10-01`: `category`, `product_id`, `name`,
`units` = the sum of `order_items.quantity`. Break `units` ties by
`product_id` ascending. The lateral subquery has to join, group, sort, and
limit - a whole report per driving row.

**Ordered by `category` ascending, then `units` descending, then
`product_id` ascending.** (18 rows.)

Edit `ex7/solution.sql`. Run: `uv run dojo test 106_drills_lateral_1 ex7`

## Exercise 8 - the whales' latest moves

Find the five customers with the highest non-cancelled revenue (sum of
`total` over their non-cancelled orders; break revenue ties by
`customer_id`). For each, return `customer_id`, `revenue`, and their most
recent non-cancelled order as `last_order_id` and `last_created_at` (ties
broken by order `id`, higher wins).

**Ordered by `revenue` descending, then `customer_id` ascending.** (5 rows.)

Edit `ex8/solution.sql`. Run: `uv run dojo test 106_drills_lateral_1 ex8`

## The gate

```python
"""Gates for 106_drills_lateral_1. Quoted verbatim in README.md."""
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
compares rows. Every prompt in this set names its ordering, so all eight are
graded with `ordered=True` - and every "top N" here carries a tie-break,
because a top-N without one is a different set on a different day.

Next: **107_drills_distinct_on_1** - the one-row-per-group shortcut, drilled.
