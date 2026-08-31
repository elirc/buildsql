# 114 - Drills: mixed gauntlet, set 3

The final problem set of the course. Every exercise welds two or three
topics; the last two are the kind of question a senior interview saves for
the end. Take them cold, then read `reading.md` even if you passed.

## Exercise 1 - who costs what

Per department: `payroll` = `sum(salary)` and `payroll_pct` =
`round(100.0 * payroll / total payroll, 1)`. Columns `department`,
`payroll`, `payroll_pct`.

**Ordered by `department` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 114_drills_mixed_3 ex1`

## Exercise 2 - the weekly bestseller board

For each week (`date_trunc('week', orders.created_at)`) touching October
2023 orders (half-open month filter on the order date): the product with
the most units sold (`sum(order_items.quantity)`, ties by `product_id`
ascending). Columns `week`, `product_id`, `name`, `units`.

**Ordered by `week` ascending.** (6 rows - Monday weeks, partial at the
edges.)

Edit `ex2/solution.sql`. Run: `uv run dojo test 114_drills_mixed_3 ex2`

## Exercise 3 - premium gear nobody got excited about

`electronics` products priced above 480 whose page (`path = '/p/<id>'`)
never recorded a `view` event with payload `value >= 999`. Columns `id`,
`name`, `price`.

**Ordered by `id` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 114_drills_mixed_3 ex3`

## Exercise 4 - where cancellations beat shipments

Per customer country: `paid`, `shipped`, `cancelled` order counts - but
only countries where `cancelled > shipped`. Columns `country`, `paid`,
`shipped`, `cancelled`.

**Ordered by `country` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 114_drills_mixed_3 ex4`

## Exercise 5 - the CEO's lieutenants, weighed

For each **direct report of the CEO** (the one staff row with NULL
`manager_id`): `name`, and `subtree` = how many people their whole subtree
contains, **including themselves**. Columns `name`, `subtree`.

**Ordered by `subtree` descending, then `name` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 114_drills_mixed_3 ex5`

## Exercise 6 - every tag's flagship

For each of the ten tags: the most expensive product carrying it (price
ties by `id` ascending). Columns `tag`, `product_id`, `name`, `price`. A
product may legitimately win both of its tags.

**Ordered by `tag` ascending.** (10 rows.)

Edit `ex6/solution.sql`. Run: `uv run dojo test 114_drills_mixed_3 ex6`

## Exercise 7 - the streak counter

One row, one column `streak_customers`: how many customers have placed
orders in **three or more consecutive calendar months** at least once
(months of `created_at`, consecutive meaning m, m+1, m+2 all present in
that customer's set of order months).

Edit `ex7/solution.sql`. Run: `uv run dojo test 114_drills_mixed_3 ex7`

## Exercise 8 - page conversion, end to end

For the ten most-viewed product pages in the whole stream: `product_id`
(parsed from the payload path), `name`, `category`, `views`, `purchases`
(both event counts for that page), and `conv_pct` = `round(100.0 *
purchases / views, 1)` (NULL-safe: guard the division with
`NULLIF(views, 0)`).

**Ordered by `views` descending, then `product_id` ascending, limited to
10 rows.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 114_drills_mixed_3 ex8`

## The gate

```python
"""Gates for 114_drills_mixed_3. Quoted verbatim in README.md."""
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
    grader.assert_rows_equal(actual, expected)


def test_ex8(shared_lesson_db):
    ex = L.exercise("ex8")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)
```

Every gate runs the reference query and yours against the same clone and
compares rows. Exercise 7 returns a single row and is graded unordered;
the rest name an ordering and use `ordered=True`.

That is the course. If these eight felt composed rather than hard, the
drills did their job.
