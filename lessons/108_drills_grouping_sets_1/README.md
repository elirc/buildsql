# 108 - Drills: GROUPING SETS, ROLLUP, CUBE, set 1

Eight problems on lesson 50: one query grouped several ways at once, subtotal
rows wearing NULLs, and `GROUPING()` to tell a synthetic NULL from a real
one. If ROLLUP-versus-CUBE-versus-spell-it-out is not yet a reflex, reread
lesson 50 before starting.

## Exercise 1 - headcount, with the bottom line

Headcount per `staff` department plus one all-staff total row in the same
result: `department`, `headcount`. The total row's `department` is NULL.

**Ordered by `department` ascending** (the NULL total row sorts last). (6
rows.)

Edit `ex1/solution.sql`. Run: `uv run dojo test 108_drills_grouping_sets_1 ex1`

## Exercise 2 - signups by country and year, rolled up

For customers in `US`, `GB`, and `DE`: signups per (country, signup year),
a subtotal per country, and a grand total. Columns `country`, `yr` =
`extract(year FROM created_at)::int`, `signups`. Use the hierarchy
shorthand, not a hand-written list of groupings.

**Ordered by `country` ascending, then `yr` ascending** (NULL subtotals
after their details). (13 rows: 9 detail + 3 country subtotals + 1 total.)

Edit `ex2/solution.sql`. Run: `uv run dojo test 108_drills_grouping_sets_1 ex2`

## Exercise 3 - a total row that says so

Orders per status plus a total row - but the total must be labelled: column
`status_label` reads `'all statuses'` on the total row and the plain status
elsewhere, column `orders` is the count. Use `GROUPING()`, not a NULL test,
to build the label.

**Ordered by `status_label` ascending.** (5 rows; `'all statuses'` happens
to sort first.)

Edit `ex3/solution.sql`. Run: `uv run dojo test 108_drills_grouping_sets_1 ex3`

## Exercise 4 - first half of 2023, months under quarters

Revenue (`sum(total)`) for orders created in the first half of 2023
(half-open: `>= '2023-01-01' AND < '2023-07-01'`), broken down by month,
subtotalled by quarter, and totalled overall. Columns `qtr`
(`date_trunc('quarter', created_at)`), `month` (`date_trunc('month',
created_at)`), `revenue`.

**Ordered by `qtr` ascending, then `month` ascending.** (9 rows: 6 months
+ 2 quarter subtotals + 1 grand total.)

Edit `ex4/solution.sql`. Run: `uv run dojo test 108_drills_grouping_sets_1 ex4`

## Exercise 5 - two breakdowns, no total

For reviews created on or after `2023-06-01` (join `products` for the
category): review counts **by category** and **by rating** in one result -
and *no* grand-total row. Columns `category`, `rating`, `reviews`; the
dimension a row is not grouped by is NULL.

**Ordered by `category` ascending, then `rating` ascending.** (11 rows: 6
categories then 5 ratings.)

Edit `ex5/solution.sql`. Run: `uv run dojo test 108_drills_grouping_sets_1 ex5`

## Exercise 6 - keep only the margins

Over orders by customers in `FR` and `CA` (join `customers`): run `GROUP BY
CUBE (country, status)` and keep **only the marginal rows** - per-country
subtotals and per-status subtotals - discarding the detail rows and the
grand total, using `GROUPING()` in `HAVING`. Columns `country`, `status`,
`orders`.

**Ordered by `country` ascending, then `status` ascending.** (6 rows: 2
countries + 4 statuses.)

Edit `ex6/solution.sql`. Run: `uv run dojo test 108_drills_grouping_sets_1 ex6`

## Exercise 7 - units and revenue by category and size

For `toys` and `food` products, over all their order lines: `units` =
`sum(quantity)` and `revenue` = `sum(quantity * price)` from `order_items`,
by (category, size), subtotalled per category, and totalled overall. The
size lives at `attributes ->> 'size'`. Columns `category`, `size`, `units`,
`revenue`.

**Ordered by `category` ascending, then `size` ascending.** (11 rows: 2x4
detail + 2 subtotals + 1 total.)

Edit `ex7/solution.sql`. Run: `uv run dojo test 108_drills_grouping_sets_1 ex7`

## Exercise 8 - two NULLs walk into a report

Headcount per manager over `staff`, with a grand total - except the CEO's
`manager_id` is genuinely NULL, so the total row's synthetic NULL needs
disambiguating. Return `manager_label`: the manager id as text, `'NOBODY'`
for the staff with no manager, `'ALL'` for the grand-total row; and
`headcount`. One row per manager, plus the `'NOBODY'` row, plus `'ALL'`.

**Ordered by `headcount` descending, then `manager_label` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 108_drills_grouping_sets_1 ex8`

## The gate

```python
"""Gates for 108_drills_grouping_sets_1. Quoted verbatim in README.md."""
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
compares rows, `ordered=True` throughout - subtotal placement is part of
what each prompt specifies, and ascending sorts put the NULL-bearing
subtotal rows after their details, which is exactly where a reader wants
them.

Next: **109_drills_reports_1** - the requests start arriving in prose.
