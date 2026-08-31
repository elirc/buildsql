# 87 - Drills: common table expressions, set 1

Eight problems on `WITH`, from lesson 14: naming an intermediate result,
chaining one CTE into the next, and reusing a single named result more than
once. Nothing here needs recursion - that is set 89. If a query in this set
feels like it wants a fourth level of nested parentheses, that is the signal
the exercise is testing for.

## Exercise 1 - name the slice you are working on

Orders created on or after 2023-10-01, summarised by status. Put the filtered
orders in a CTE called whatever you like, then aggregate that. Columns, in
this order: `status`, `orders` = how many, `avg_total` = the average `total`
rounded to 2.

**Ordered by `status` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 87_drills_ctes_1 ex1`

## Exercise 2 - one result, used twice

Revenue by order status, with each status's share of all revenue. Compute
`status`, `orders` = count, `revenue` = `sum(total)` once in a CTE, then read
that CTE twice in the final query - once for the rows and once for the grand
total. Columns, in this order: `status`, `orders`, `revenue` rounded to 2, and
`pct_of_revenue` = `round(100 * revenue / <total revenue>, 2)`.

**Ordered by `status` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 87_drills_ctes_1 ex2`

## Exercise 3 - two links in a chain

Units sold per category, built in two steps: a first CTE that sums `quantity`
per `product_id` from `order_items`, and a second CTE that joins that to
`products` and sums per category. Columns, in this order: `category`, `units`.

**Ordered by `units` descending, then `category` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 87_drills_ctes_1 ex3`

## Exercise 4 - a CTE that holds a single number

Products priced above 1.9 times the average price of the whole catalog.
Compute the cutoff in a one-row CTE and `CROSS JOIN` it into the query, so the
threshold has a name instead of being an anonymous subquery buried in `WHERE`.
Columns, in this order: `id`, `name`, `price`.

**Ordered by `id` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 87_drills_ctes_1 ex4`

## Exercise 5 - three links, then a self-reference

Countries whose customers order more often than the typical country's do.
Build three CTEs: customers per country; orders per country (join `orders` to
`customers`); and a third that divides one by the other as
`round(orders::numeric / customers, 3)`. Then return the countries whose
`orders_per_customer` is above the average `orders_per_customer` across all
countries - which means reading the third CTE twice.

Columns, in this order: `country`, `customers`, `orders`,
`orders_per_customer`.

**Ordered by `orders_per_customer` descending, then `country` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 87_drills_ctes_1 ex5`

## Exercise 6 - label first, aggregate second

Bucket every customer who has at least one non-`cancelled` order by how many
such orders they placed: `heavy` for 15 or more, `regular` for 8 to 14,
`light` for fewer than 8. Use one CTE to count per customer and a second to
attach the label, then aggregate the labelled rows. Columns, in this order:
`tier`, `customers`, `revenue` = the summed non-cancelled `total` rounded to
2, `avg_orders` = the average order count rounded to 2.

**Ordered by `tier` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 87_drills_ctes_1 ex6`

## Exercise 7 - the diamond

Customers whose non-`cancelled` revenue is more than 1.8 times the average
customer's. Compute revenue per customer in one CTE; compute the average of
that in a second CTE that reads the first; then have the final query read
*both*. Columns, in this order: `customer_id`, `revenue` rounded to 2, and
`above_average` = `round(revenue - <average revenue>, 2)`.

Compare against the unrounded average.

**Ordered by `revenue` descending, then `customer_id` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 87_drills_ctes_1 ex7`

## Exercise 8 - the worst-reviewed product in each category

For every category, the product with the lowest average rating. Chain three
CTEs: review counts and `round(avg(rating), 3)` per product; that joined to
`products` for the category and name; and the minimum average rating per
category. Then join the last two back together.

Products tied on the rounded average must all appear. Columns, in this order:
`category`, `id`, `name`, `reviews`, `avg_rating`.

**Ordered by `category` ascending, then `id` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 87_drills_ctes_1 ex8`

## The gate

```python
"""Gates for 87_drills_ctes_1. Quoted verbatim in README.md."""
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
compares the rows **in order**. The gate cannot see whether you used a CTE at
all - several of these have a perfectly good single-statement spelling, and the
references show them. Write the CTE version anyway; the point of the set is
the shape, and the reading explains when the two forms stop being equivalent.

Next: **88_drills_ctes_2**, on refactoring with `WITH`.
