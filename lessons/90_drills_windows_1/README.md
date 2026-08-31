# 90 - Drills: window functions 1 - numbering and ranking

Eight problems on `row_number()`, `rank()` and `dense_rank()` from lesson 15.
The three look interchangeable until ties appear, at which point they disagree
in ways that matter; exercise 2 puts all three side by side on a column with
plenty of ties so you can watch it happen.

## Exercise 1 - rank the categories

One row per product category: `category`, `products` = how many, and `rnk` =
its position when categories are ordered by product count, largest first.

A window function may take an aggregate as its argument, so `rank() OVER
(ORDER BY count(*) DESC)` is legal in a grouped query - the window runs after
the grouping.

**Ordered by `rnk` ascending, then `category` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 90_drills_windows_1 ex1`

## Exercise 2 - three numberings of the same rows

Every review of product 42, with all three ranking functions over the same
descending `rating`. Columns, in this order: `id`, `rating`, `rnk` =
`rank() OVER (ORDER BY rating DESC)`, `drnk` = `dense_rank()` over the same
window, and `rn` = `row_number() OVER (ORDER BY rating DESC, id)`.

**Ordered by `rating` descending, then `id` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 90_drills_windows_1 ex2`

## Exercise 3 - the first two customers of every country

For each country, the two customers who signed up earliest. Columns, in this
order: `country`, `id`, `name`, `created_at`, `rn` = 1 or 2.

Break ties on `created_at` with `id` ascending. A window function cannot be
used in `WHERE`, so the numbering has to happen one level down.

**Ordered by `country` ascending, then `rn` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 90_drills_windows_1 ex3`

## Exercise 4 - ranked inside your hiring year

Every member of staff, ranked by salary within the calendar year they were
hired. Columns, in this order: `id`, `name`, `hire_year` =
`extract(year FROM hired_on)::int`, `hired_on`, `salary`, `year_rank` =
`rank()` over that year's staff, highest salary first.

**Ordered by `hire_year` ascending, then `year_rank` ascending, then `id`
ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 90_drills_windows_1 ex4`

## Exercise 5 - the third most expensive in each category

Exactly one row per category: the product sitting in third place when that
category is sorted by price descending, with `id` ascending as the tie-break.
Columns, in this order: `category`, `id`, `name`, `price`.

**Ordered by `category` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 90_drills_windows_1 ex5`

## Exercise 6 - which status won each month

Revenue by month and status, with each status's rank inside its own month.
Build the monthly totals in a CTE, then rank within `PARTITION BY month`.
Columns, in this order: `month` = `date_trunc('month', created_at)`, `status`,
`revenue` = `sum(total)` rounded to 2, `rnk` = position by revenue within that
month, largest first.

Rank on the raw revenue, not the rounded column.

**Ordered by `month` ascending, then `rnk` ascending, then `status`
ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 90_drills_windows_1 ex6`

## Exercise 7 - two rankings at once

The three most expensive products in each category, showing both where they
sit in their category and where they sit in the whole catalog. Columns, in
this order: `category`, `id`, `name`, `price`, `category_rank` = 1 to 3 within
the category, `overall_rank` = position across all 10,000 products.

Both rankings order by `price` descending with `id` ascending as the
tie-break.

**Ordered by `category` ascending, then `category_rank` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 90_drills_windows_1 ex7`

## Exercise 8 - the most and least reviewed, per category

One row per category, naming its most-reviewed and least-reviewed product.
Count reviews per product with a `LEFT JOIN` so products with none are
included, number each category's products from both ends, and then collapse
each category to a single row.

Columns, in this order: `category`, `most_reviewed` = that product's `name`,
`most` = its review count, `least_reviewed`, `least`. Ties on the count are
broken by the smaller `id` at both ends.

**Ordered by `category` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 90_drills_windows_1 ex8`

## The gate

```python
"""Gates for 90_drills_windows_1. Quoted verbatim in README.md."""
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
compares the rows **in order**. Because a window function is evaluated after
`WHERE` and `GROUP BY` but before `ORDER BY` and `LIMIT`, a rank you want to
filter on always needs a subquery or CTE around it - "window functions are not
allowed in WHERE" is the error to expect, and it is telling you where to put
the extra level.

Next: **91_drills_windows_2**, on `PARTITION BY` against `GROUP BY`.
