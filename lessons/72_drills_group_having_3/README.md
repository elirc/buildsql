# 72 - Drills: GROUP BY and HAVING, set 3

The last grouping set, and the one that lives in `HAVING`: thresholds on
counts, sums, minimums and maximums; two conditions at once; an aggregate
that appears in the filter but not in the output; and finally groups computed
from the output of other groups. Lesson 07 is the source, with 13's
subqueries doing the heavy lifting in the last two.

## Exercise 1 - the groups of size one

Among the `order_items` rows whose `order_id` is 3000 or less, find the
orders that carry exactly one item line. Return `order_id` and `lines` = the
number of lines (which will be 1 for every row you return).

**Ordered by `order_id` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 72_drills_group_having_3 ex1`

## Exercise 2 - HAVING on a minimum

Which product categories contain nothing cheaper than 1.25? Return
`category`, `products` = the number of products in it, and `cheapest` = the
lowest price in it, keeping only the categories whose minimum price is above
1.25.

**Ordered by `category` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 72_drills_group_having_3 ex2`

## Exercise 3 - HAVING on a sum

Among paid orders only, find the customers whose paid spend exceeds 15000.
Return `customer_id`, `paid_orders` = how many paid orders they have, and
`paid_revenue` = the sum of those totals rounded to 2.

**Ordered by `customer_id` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 72_drills_group_having_3 ex3`

## Exercise 4 - filter the rows, threshold the group

Which products have collected more than 30 five-star reviews? Return
`product_id` and `five_star` = how many 5-star reviews it has.

**Ordered by `five_star` descending, then `product_id` ascending** - the
second key is the tie-break, and there are plenty of ties.

Edit `ex4/solution.sql`. Run: `uv run dojo test 72_drills_group_having_3 ex4`

## Exercise 5 - two conditions on one group

Find the customers who are both frequent and expensive: at least 18 orders,
and an average order total above 1200. Return `customer_id`, `orders` = their
order count, and `avg_total` = their average order total rounded to 2.

Cancelled orders count here - no `WHERE` clause.

**Ordered by `customer_id` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 72_drills_group_having_3 ex5`

## Exercise 6 - an aggregate that never reaches the output

Which categories contain at least one product priced above 499.5? Return only
`category` and `products` = the number of products in that category - no
price column at all.

The test itself is an aggregate; it just does not appear in the SELECT list.

**Ordered by `category` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 72_drills_group_having_3 ex6`

## Exercise 7 - each group as a share of the whole

For each order status, return `status`, `orders` = the row count, `revenue` =
`sum(total)` rounded to 2, and `revenue_pct` = that status's revenue as a
percentage of the revenue of all orders, rounded to 2.

Get the overall revenue from a scalar subquery over `orders`, and write the
percentage as `100.0 * sum(total) / (that subquery)`.

**Ordered by `status` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 72_drills_group_having_3 ex7`

## Exercise 8 - grouping a grouped result, then joining it

Where do the heavy buyers live? A heavy buyer is a customer with more than 15
orders. Count them per country: return `country` and `heavy_buyers` = how
many heavy buyers that country has.

Compute the heavy buyers with a grouped subquery over `orders`, then join
that result to `customers` to get the country.

**Ordered by `country` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 72_drills_group_having_3 ex8`

## The gate

```python
"""Gates for 72_drills_group_having_3. Quoted verbatim in README.md."""
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
compares rows in the order the prompt names. Two of these prompts sort by an
aggregate and then by an id - the id is the tie-break, and without it the
gate will tell you the rows are right and the order is not.

Next: **73_drills_inner_joins_1**, where a second table finally joins the
party.
