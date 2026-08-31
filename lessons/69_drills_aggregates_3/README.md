# 69 - Drills: aggregates, set 3

The last aggregates set, and the one closest to the work: KPI rows built
entirely out of `FILTER`, counting that stays honest about NULLs, and two
finishers that aggregate across a join. Source lesson is 06 throughout, with
08 and 09 supplying the joins in exercises 7 and 8.

## Exercise 1 - the order KPI row

One row of order KPIs, in this column order: `paid_revenue` = the sum of
`total` over paid orders rounded to 2, `cancelled_revenue` = the same for
cancelled orders rounded to 2, `pending_orders` = how many orders are
pending, and `orders` = how many orders there are altogether.

Edit `ex1/solution.sql`. Run: `uv run dojo test 69_drills_aggregates_3 ex1`

## Exercise 2 - the staff KPI row

One row about `staff`, in this column order: `payroll` = the sum of salaries
rounded to 2, `avg_salary` = the average salary rounded to 2, `top_salary` =
the highest salary, `first_hire` = the earliest `hired_on`, and `rootless` =
how many staff have no manager.

Edit `ex2/solution.sql`. Run: `uv run dojo test 69_drills_aggregates_3 ex2`

## Exercise 3 - a histogram in a single row

Turn the rating distribution of `reviews` sideways. Return one row with six
columns in this order: `r1`, `r2`, `r3`, `r4`, `r5` - the number of reviews
with each rating from 1 to 5 - and `total` = the number of reviews
altogether.

Edit `ex3/solution.sql`. Run: `uv run dojo test 69_drills_aggregates_3 ex3`

## Exercise 4 - extremes and how many values there are

One row about product prices: `cheapest` = the minimum price, `dearest` = the
maximum, `distinct_prices` = how many different price values exist, and
`spread` = `max(price) - min(price)` rounded to 2 - in that column order.

Edit `ex4/solution.sql`. Run: `uv run dojo test 69_drills_aggregates_3 ex4`

## Exercise 5 - counting people, not orders

One row about the customers behind the orders, in this column order:
`buyers` = how many distinct customers appear in `orders`, `paid_buyers` =
how many distinct customers have at least one paid order, `cancel_buyers` =
how many have at least one cancelled order, and `whale_buyers` = how many
have at least one order with a `total` above 1900.

The three filtered counts overlap - a customer can be in all of them.

Edit `ex5/solution.sql`. Run: `uv run dojo test 69_drills_aggregates_3 ex5`

## Exercise 6 - ratios between aggregates

One row of derived ratios over `orders`, in this column order: `orders` =
the row count, `buyers` = the number of distinct customers,
`orders_per_buyer` = orders divided by buyers as numeric rounded to 3, and
`revenue_per_buyer` = `sum(total)` divided by buyers rounded to 2.

Edit `ex6/solution.sql`. Run: `uv run dojo test 69_drills_aggregates_3 ex6`

## Exercise 7 - review health for one category

Join `reviews` to `products` and describe the electronics category in one
row, in this column order: `reviews` = how many reviews electronics products
have, `products_covered` = how many distinct products those reviews touch,
`avg_rating` = the average rating rounded to 2, and `negative_pct` = the
percentage of those reviews rated 2 or lower, rounded to 2.

Edit `ex7/solution.sql`. Run: `uv run dojo test 69_drills_aggregates_3 ex7`

## Exercise 8 - customers who never bought

Describe the Japanese customer base in one row, counting the customers who
have never ordered anything. Outer-join `customers` to `orders` and return,
in this column order: `customers` = the number of distinct JP customers,
`buyers` = how many of them have at least one order, `orders` = the total
number of orders they placed, `revenue` = the sum of those totals rounded to
2 (0 if there were none), and `orders_per_customer` = orders divided by
customers as numeric, rounded to 4.

The join must be a LEFT JOIN and the country filter belongs to `customers`.

Edit `ex8/solution.sql`. Run: `uv run dojo test 69_drills_aggregates_3 ex8`

## The gate

```python
"""Gates for 69_drills_aggregates_3. Quoted verbatim in README.md."""
from dojo import grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(shared_lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=False)


def test_ex2(shared_lesson_db):
    ex = L.exercise("ex2")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=False)


def test_ex3(shared_lesson_db):
    ex = L.exercise("ex3")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=False)


def test_ex4(shared_lesson_db):
    ex = L.exercise("ex4")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=False)


def test_ex5(shared_lesson_db):
    ex = L.exercise("ex5")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=False)


def test_ex6(shared_lesson_db):
    ex = L.exercise("ex6")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=False)


def test_ex7(shared_lesson_db):
    ex = L.exercise("ex7")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=False)


def test_ex8(shared_lesson_db):
    ex = L.exercise("ex8")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=False)
```

Every gate runs the reference query and yours against the same clone and
compares rows. These are all single-row results, so the comparison is
unordered; the column count and the column order still matter, and a
"COLUMN MISMATCH" message means you have one number too many or too few.

Next: **70_drills_group_having_1**, where the single row becomes one row per
group.
