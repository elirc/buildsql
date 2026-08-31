# 112 - Drills: mixed gauntlet, set 1

The first of three cumulative gauntlets: every exercise welds two or three
topics from anywhere in the course - JSONB with joins, anti-joins with
business rules, window frames with verdicts. Nothing here is new; the drill
is recognising which tools the sentence needs and composing them cleanly.

## Exercise 1 - clothing revenue by colour

Line-item revenue (`sum(quantity * price)` over `order_items`) for
`clothing` products, grouped by the product's `color` attribute. Columns
`color`, `revenue`.

**Ordered by `color` ascending.** (5 rows.)

Edit `ex1/solution.sql`. Run: `uv run dojo test 112_drills_mixed_1 ex1`

## Exercise 2 - the weekly rhythm

Orders per ISO day of week, with a weekend flag. Columns `dow` =
`extract(isodow FROM created_at)::int` (Monday is 1), `orders`,
`is_weekend` = boolean, true for days 6 and 7.

**Ordered by `dow` ascending.** (7 rows.)

Edit `ex2/solution.sql`. Run: `uv run dojo test 112_drills_mixed_1 ex2`

## Exercise 3 - German signups that never stuck

Customers in `DE` who signed up on or after `2023-01-01` and have **no
non-cancelled order** - never ordered at all, or every order cancelled.
Columns `id`, `name`, `created_at`.

**Ordered by `id` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 112_drills_mixed_1 ex3`

## Exercise 4 - the person in the middle

For every `staff` department: the person on the **middle rung** of its
salary ladder. Rank each department's staff by `salary DESC, id ASC`; with
`n` people, the middle is position `(n + 1) / 2` using integer division
(so 5 people give position 3, 4 people give position 2). Columns
`department`, `name`, `salary`.

**Ordered by `department` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 112_drills_mixed_1 ex4`

## Exercise 5 - who lapsed in November?

One row, one column `lapsed`: how many customers placed at least one order
in October 2023 but none in November 2023. (Half-open month ranges; the
data ends November 14, which counts as November.)

Edit `ex5/solution.sql`. Run: `uv run dojo test 112_drills_mixed_1 ex5`

## Exercise 6 - price versus reputation

Per category: `avg_price` = `round(avg(products.price), 2)` and
`avg_rating` = `round(avg(reviews.rating), 2)` across all reviews of that
category's products. Columns `category`, `avg_price`, `avg_rating`. The
two averages live at different grains - aggregate each on its own, then
join; one big join-then-average pass computes a subtly different (and
wrong) `avg_price`.

**Ordered by `category` ascending.** (6 rows.)

Edit `ex6/solution.sql`. Run: `uv run dojo test 112_drills_mixed_1 ex6`

## Exercise 7 - beating your own average

Monthly `electronics` line revenue for 2023, each month judged against the
average of **up to three prior months** (the current month excluded from
its own benchmark). Columns `month`, `revenue`, `prior3_avg` = the frame
average rounded to 2 (NULL for January, which has no prior months), `flag`
= `'above'` / `'below'` comparing the unrounded values (NULL for January).

**Ordered by `month` ascending.** (11 rows.)

Edit `ex7/solution.sql`. Run: `uv run dojo test 112_drills_mixed_1 ex7`

## Exercise 8 - the whales' favourite aisles

The five customers with the highest non-cancelled revenue (`sum(total)`,
ties by `customer_id`), each with their favourite category: the one where
they bought the most units (`sum(quantity)` over non-cancelled orders,
ties broken by `category` ascending). Columns `customer_id`, `revenue`,
`fav_category`.

**Ordered by `revenue` descending, then `customer_id` ascending.** (5
rows.)

Edit `ex8/solution.sql`. Run: `uv run dojo test 112_drills_mixed_1 ex8`

## The gate

```python
"""Gates for 112_drills_mixed_1. Quoted verbatim in README.md."""
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
    grader.assert_rows_equal(actual, expected)


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
compares rows. Exercise 5 returns a single row and is graded unordered; the
rest name an ordering and use `ordered=True`.

Next: **113_drills_mixed_2** - more welds, tighter tolerances.
