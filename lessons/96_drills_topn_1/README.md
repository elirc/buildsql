# 96 - Drills: top-N and top-N per group, set 1

Eight problems on "the best few" - lesson 03 for plain `ORDER BY ... LIMIT`,
lesson 15 for the ranking window functions that do the same job once per
group. The whole set turns on one distinction: a global top-N is a sort with
a limit, and a per-group top-N is `row_number()` (or `dense_rank()`) over a
`PARTITION BY` with the filter applied one query level up. If either half
feels shaky, reread 03 and 15 before starting.

Every prompt below names its tie-break. Take that seriously: two rows with
the same sort key can come back in either order, so a top-N without a
tie-break is a query whose answer changes between runs.

## Exercise 1 - the ten cheapest groceries

The ten cheapest products in the `food` category. Return `id`, `name`, and
`price`.

**Ordered by `price` ascending, then `id` ascending**, ten rows.

Edit `ex1/solution.sql`. Run: `uv run dojo test 96_drills_topn_1 ex1`

## Exercise 2 - the newest customer in each country

For every country in `customers`, the single most recently created customer
there. Return `country`, `id`, `name`, and `created_at`. Rank each country's
customers by `created_at` descending, breaking ties by `id` descending, and
keep the first.

**Ordered by `country` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 96_drills_topn_1 ex2`

## Exercise 3 - three biggest orders per status

For each `orders.status`, the three largest orders by `total`. Return
`status`, `id`, and `total`, ranking within a status by `total` descending
with `id` ascending as the tie-break and keeping ranks 1 to 3.

**Ordered by `status` ascending, then `total` descending, then `id`
ascending.** (12 rows.)

Edit `ex3/solution.sql`. Run: `uv run dojo test 96_drills_topn_1 ex3`

## Exercise 4 - the two top price levels per category

For each product `category`, every product sitting at one of the two highest
*prices* in that category - not the two highest-priced rows, the two highest
price levels, so a tie at the top brings all of the tied products along.
Return `category`, `id`, `name`, and `price`.

Rank by `price` descending with `dense_rank()` and keep ranks 1 and 2.

**Ordered by `category` ascending, then `price` descending, then `id`
ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 96_drills_topn_1 ex4`

## Exercise 5 - the two most reviewed products per category

Count the reviews of every product, then for each product `category` keep
the two products with the most reviews. Return `category`, `product_id`, and
`reviews` = that product's review count, ranking within a category by
`reviews` descending with `product_id` ascending as the tie-break.

**Ordered by `category` ascending, then `reviews` descending, then
`product_id` ascending.** (12 rows.)

Edit `ex5/solution.sql`. Run: `uv run dojo test 96_drills_topn_1 ex5`

## Exercise 6 - the runner-up, not the winner

For each product `category`, the *second* most expensive product only.
Return `category`, `id`, `name`, and `price`, ranking within a category by
`price` descending with `id` ascending as the tie-break and keeping rank 2
exactly.

**Ordered by `category` ascending.** (6 rows.)

Edit `ex6/solution.sql`. Run: `uv run dojo test 96_drills_topn_1 ex6`

## Exercise 7 - each month's best day

For every month in `orders`, the single day with the highest total revenue.
Aggregate `sum(total)` per `date_trunc('day', created_at)` first, then rank
those days within `date_trunc('month', created_at)` by revenue descending
with the day ascending as the tie-break. Return `month`, `day`, and
`revenue`.

**Ordered by `month` ascending.** (13 rows.)

Edit `ex7/solution.sql`. Run: `uv run dojo test 96_drills_topn_1 ex7`

## Exercise 8 - each country's busiest buyer

For every country, the customer who placed the most orders. Join `customers`
to `orders`, count orders per customer, then rank within `country` by order
count descending with `customer_id` ascending as the tie-break and keep the
first. Return `country`, `customer_id`, and `orders`.

Customers with no orders never win, so an inner join is enough.

**Ordered by `country` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 96_drills_topn_1 ex8`

## The gate

```python
"""Gates for 96_drills_topn_1. Quoted verbatim in README.md."""
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
compares rows. All eight prompts name an ordering, so all eight are graded
with `ordered=True` - which is exactly the point of a top-N drill: if you
cannot state the order, you cannot state which rows are the top ones.

Next: **97_drills_pivots_1**, turning rows into columns with `CASE` and
`FILTER`.
