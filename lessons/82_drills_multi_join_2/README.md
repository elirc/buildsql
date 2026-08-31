# 82 - Drills: multi-join reports 2

Eight more report queries, this time with two independent branches hanging
off the same table - sales on one side, reviews on the other. This set draws
on lessons 08 and 12 and is mostly one lesson repeated in different costumes:
when a report needs measures from two one-to-many relationships, you
summarise each branch before you join them.

## Exercise 1

Per category, over reviews created on or after `2023-08-01`: how many
distinct products received a review in that window, how many reviews there
were, and the average rating rounded to 2 decimal places. Columns, in this
order: `category`, `products`, `reviews`, `avg_rating`.

**Ordered by `category` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 82_drills_multi_join_2 ex1`

## Exercise 2

For `books` products only, per rating: how many reviews carry that rating and
how many **distinct** products received it. Columns, in this order: `rating`,
`reviews`, `products`.

**Ordered by `rating` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 82_drills_multi_join_2 ex2`

## Exercise 3

For each month from `2023-01-01` up to (but not including) `2023-12-01`: how
many customers signed up that month and how many orders were placed that
month. The two counts are unrelated to each other - an order in March has
nothing to do with a signup in March. Columns, in this order: `month` (use
`date_trunc('month', created_at)`), `new_customers`, `orders`.

**Ordered by `month` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 82_drills_multi_join_2 ex3`

## Exercise 4

Per category, over the whole dataset: `units` (the sum of
`order_items.quantity`), `revenue` (the sum of `quantity * price` from the
order line), and `avg_rating` - the average of **every** review of every
product in that category, rounded to 2 decimal places. Columns, in this
order: `category`, `units`, `revenue`, `avg_rating`.

**Ordered by `category` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 82_drills_multi_join_2 ex4`

## Exercise 5

For orders created on or after `2023-11-01`, one row per `(category,
status)` pair: how many **distinct** orders contained that category with that
status, and the revenue (`quantity * price` from the order line). Columns, in
this order: `category`, `status`, `orders`, `revenue`.

**Ordered by `category` ascending, then `status` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 82_drills_multi_join_2 ex5`

## Exercise 6

For every `electronics` product priced above 495: `units` (total quantity
ever sold, `0` if it has never been sold), `reviews` (how many it has, `0` if
none), and `avg_rating` rounded to 2 decimal places - which stays **NULL** if
the product has no reviews. Columns, in this order: `id`, `name`, `units`,
`reviews`, `avg_rating`.

**Ordered by `id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 82_drills_multi_join_2 ex6`

## Exercise 7

Customers who bought products from **at least 3 different categories** on
orders created on or after `2023-11-01`. Columns, in this order: `id`,
`name`, `categories` (how many distinct categories).

**Ordered by `categories` descending, then `id` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 82_drills_multi_join_2 ex7`

## Exercise 8

A country scorecard for orders created on or after `2023-11-01`. Per customer
country: `revenue` (the sum of `quantity * price` from the order line),
`units` (the sum of quantities), `orders` (how many **distinct** orders), and
`top_product` - the `name` of the product with the most units sold in that
country, ties broken by the lower product `id`. Columns, in this order:
`country`, `revenue`, `units`, `orders`, `top_product`.

**Ordered by `revenue` descending, then `country` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 82_drills_multi_join_2 ex8`

## The gate

```python
"""Gates for 82_drills_multi_join_2. Quoted verbatim in README.md."""
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
compares the rows **in order**. If a `units` or `revenue` column comes back
enormous - orders of magnitude larger than the same measure in lesson 81 -
you have joined sales and reviews in the same `FROM`, and the reading for ex4
explains exactly what happened.

Next: **`83_drills_subqueries_1`**.
