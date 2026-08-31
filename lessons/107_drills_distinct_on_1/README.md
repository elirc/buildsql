# 107 - Drills: DISTINCT ON, set 1

Eight problems on lesson 49: `DISTINCT ON (expr)` keeps the first row per
group, "first" is whatever the `ORDER BY` says after its mandatory leading
match with the `DISTINCT ON` expression, and a missing tie-break is a bug
that has not surfaced yet. If any of that sentence is news, reread 49.

## Exercise 1 - the order that started each pile

One row per order `status`: the **oldest** order carrying it. Columns
`status`, `order_id`, `created_at`. Break `created_at` ties by `id`,
lower id wins.

**Ordered by `status` ascending.** (4 rows.)

Edit `ex1/solution.sql`. Run: `uv run dojo test 107_drills_distinct_on_1 ex1`

## Exercise 2 - the latest order that still counts

For every customer with `id <= 25`: their most recent **non-cancelled**
order. Columns `customer_id`, `order_id`, `status`, `created_at`. Ties on
`created_at` broken by order `id`, higher wins. A customer whose orders are
all cancelled (or who has none) does not appear.

**Ordered by `customer_id` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 107_drills_distinct_on_1 ex2`

## Exercise 3 - the stream's last word, per type

For each of the five `event_type` values, the most recent event: columns
`event_type`, `event_id`, `ts`.

**Ordered by `event_type` ascending.** (5 rows.)

Edit `ex3/solution.sql`. Run: `uv run dojo test 107_drills_distinct_on_1 ex3`

## Exercise 4 - the cheapest of each size

Among `clothing` products, the cheapest product of each `size` in
`attributes`. Columns `size`, `id`, `name`, `price`. Break price ties by
`id` ascending. The group key is a JSONB expression - `DISTINCT ON` does
not care.

**Ordered by `size` ascending.** (4 rows.)

Edit `ex4/solution.sql`. Run: `uv run dojo test 107_drills_distinct_on_1 ex4`

## Exercise 5 - the order that opened each month

For each calendar month of 2023, the **first** order created in it. Columns
`month` (`date_trunc('month', created_at)`), `order_id`, `created_at`. Ties
broken by order `id` ascending.

**Ordered by `month` ascending.** (11 rows - the data ends mid-November.)

Edit `ex5/solution.sql`. Run: `uv run dojo test 107_drills_distinct_on_1 ex5`

## Exercise 6 - every manager's newest hire

For every staff member who manages at least one person: `manager_id`, the
manager's `name` as `manager`, and their most recently hired direct report
as `newest_report` with that report's `hired_on`. Ties on `hired_on` broken
by the report's `id`, higher wins. You will need the self-join from lesson
10 to put the manager's name on the row.

**Ordered by `manager_id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 107_drills_distinct_on_1 ex6`

## Exercise 7 - which country won each month?

For each calendar month of 2023: the customer country with the highest
non-cancelled order revenue (`sum(total)`, join `customers` for the
country; revenue ties broken by `country` ascending). Columns `month`
(`date_trunc('month', created_at)`), `country`, `revenue`. Aggregate
first (revenue per month per country), then pick per month - and note the
required output order below, which is **not** the order `DISTINCT ON`
will hand you.

**Ordered by `revenue` descending, then `month` ascending.** (11 rows.)

Edit `ex7/solution.sql`. Run: `uv run dojo test 107_drills_distinct_on_1 ex7`

## Exercise 8 - when did we last see them?

For every customer with `id <= 10`: `id`, `name`, and their most recent
event as `last_event_type` and `last_ts` - keeping customers with **no
events at all**, with NULLs in both event columns.

**Ordered by `id` ascending.** (10 rows.)

Edit `ex8/solution.sql`. Run: `uv run dojo test 107_drills_distinct_on_1 ex8`

## The gate

```python
"""Gates for 107_drills_distinct_on_1. Quoted verbatim in README.md."""
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
compares rows. Every prompt names an ordering, so all eight are graded with
`ordered=True`. The reference solutions all use the `row_number() = 1`
idiom instead of `DISTINCT ON` - the portable spelling of the same pick.

Next: **108_drills_grouping_sets_1** - subtotals, grand totals, and the NULL
that is not really a NULL.
