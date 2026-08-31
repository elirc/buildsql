# 93 - Drills: window functions 4 - buckets, shares and joins

Eight problems from lesson 16 on `ntile()`, on expressing a row as a
percentage of its partition, and on running windows over the result of a join.
Between them they cover most of what a "customer segmentation" or "category
mix" report actually is.

## Exercise 1 - salary quartiles inside each department

Every member of staff, with the quartile they fall into **within their own
department** when that department is sorted by salary, highest first. Columns,
in this order: `id`, `name`, `department`, `salary`, `quartile` = `ntile(4)`
over that window, with `id` ascending as the tie-break.

**Ordered by `department` ascending, then `quartile` ascending, then `id`
ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 93_drills_windows_4 ex1`

## Exercise 2 - what each company-wide quartile looks like

Split all 500 staff into four quartiles by salary, highest first, and describe
each. Columns, in this order: `quartile`, `staff` = how many, `min_salary`
rounded to 2, `max_salary` rounded to 2.

The bucket has to be computed one level down before you can group by it.

**Ordered by `quartile` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 93_drills_windows_4 ex2`

## Exercise 3 - each line's share of its order

Every order item belonging to orders 1 to 300, joined to `products` for the
name, and shown next to its order's total. Columns, in this order: `id` (the
order item's), `order_id`, `name`, `line_total` = `round(quantity * price, 2)`,
`order_total` = the same sum over the whole order rounded to 2, and
`pct_of_order` = `round(100 * <line> / <order total>, 2)`.

The window partitions by `order_id` and runs over the joined rows.

**Ordered by `order_id` ascending, then `id` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 93_drills_windows_4 ex3`

## Exercise 4 - twelve countries into five buckets

Bucket the countries by customer count, largest first, with `ntile(5)`, then
describe each bucket. Columns, in this order: `bucket`, `countries` = how many
landed there, `min_customers`, `max_customers`.

Twelve does not divide by five - look at the `countries` column and note where
`ntile` puts the two spare rows.

**Ordered by `bucket` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 93_drills_windows_4 ex4`

## Exercise 5 - category mix within each price band

Group products by price band and category, and give each category its share of
its band. The band is `floor(price / 100) * 100`. Columns, in this order:
`band`, `category`, `products`, `pct_of_band` = `round(100.0 * count(*) /
sum(count(*)) OVER (PARTITION BY <the band expression>), 2)`.

**Ordered by `band` ascending, then `category` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 93_drills_windows_4 ex5`

## Exercise 6 - customer deciles by order count

Count each customer's orders and their revenue, split the customers into ten
deciles by order count (most orders first, `customer_id` ascending as the
tie-break), then describe each decile. Columns, in this order: `decile`,
`customers`, `min_orders`, `max_orders`, `revenue` = the summed `total`
rounded to 2.

**Ordered by `decile` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 93_drills_windows_4 ex6`

## Exercise 7 - the two biggest countries of every month

Revenue by month and country, keeping the top two countries per month with
each one's share of that month. Columns, in this order: `month` =
`date_trunc('month', o.created_at)`, `country`, `revenue` rounded to 2,
`pct_of_month` = `round(100 * revenue / <that month's revenue>, 2)`, `rn` = 1
or 2.

Ties on revenue are broken by `country` ascending.

**Ordered by `month` ascending, then `rn` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 93_drills_windows_4 ex7`

## Exercise 8 - how much revenue lives in the top quartile

Total each product's revenue as `sum(quantity * price)` over `order_items`,
split the products into four quartiles by revenue (highest first,
`product_id` ascending as the tie-break), and report each quartile. Columns,
in this order: `quartile`, `products`, `revenue` rounded to 2, `pct_of_total`
= `round(100 * <quartile revenue> / <all revenue>, 2)`.

Products that were never ordered do not appear in `order_items` and so are
not bucketed at all.

**Ordered by `quartile` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 93_drills_windows_4 ex8`

## The gate

```python
"""Gates for 93_drills_windows_4. Quoted verbatim in README.md."""
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
compares the rows **in order**. `ntile` needs a fully deterministic window
`ORDER BY` or the bucket boundaries wander between runs, which is why every
prompt in this set spells out a tie-break.

Next: **94_drills_frames_1**, on `ROWS BETWEEN` and moving averages.
