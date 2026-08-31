# 111 - Drills: report requests, set 3

The last reports set, and the hardest translations: relative time windows,
window functions inside business asks, and one genuine interview classic at
the end. The quotes are the request; the contract below each is what the
gate grades.

## Exercise 1 - what did yesterday look like?

> "Morning digest: yesterday's traffic in one line - events, distinct
> visitors, purchases."

"Yesterday" is the last complete day of the stream: with `last_day =
date_trunc('day', max(ts))`, the window is `ts >= last_day - interval '1
day' AND ts < last_day`. One row: `events`, `actives` (distinct
`customer_id`), `purchases` (events of type `'purchase'`).

Edit `ex1/solution.sql`. Run: `uv run dojo test 111_drills_reports_3 ex1`

## Exercise 2 - books versus electronics, head to head

> "Settle an argument: October, real money only - did books or electronics
> earn more?"

One row, two columns: `books_rev` and `electronics_rev`, each the
`sum(quantity * price)` of that category's order lines for orders created
in October 2023 with `status <> 'cancelled'`.

Edit `ex2/solution.sql`. Run: `uv run dojo test 111_drills_reports_3 ex2`

## Exercise 3 - a price ladder for the toy aisle

> "Bucket the toys for the gift guide: under 100, 100 to 300, 300 plus.
> How many in each shelf and the average price - cheap shelf first."

Columns `band` (exactly the labels `'under 100'`, `'100 to 299.99'`,
`'300 and up'`), `products`, `avg_price` = `round(avg(price), 2)`.
**Ordered cheapest band first** - sort by `min(price)` per band, not
alphabetically. (3 rows.)

Edit `ex3/solution.sql`. Run: `uv run dojo test 111_drills_reports_3 ex3`

## Exercise 4 - who is underpaid around here?

> "HR review: everyone sitting 20 percent or more below their own
> department's average salary, worst-off first."

Columns `id`, `name`, `department`, `salary`, `dept_avg` =
`round(avg, 2)`, `below_pct` = `round(100.0 * (avg - salary) / avg, 1)`.
Qualify on the **unrounded** average (`salary <= 0.8 * dept_avg`).
**Ordered by the unrounded gap ratio descending, then `id` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 111_drills_reports_3 ex4`

## Exercise 5 - does one product carry each category?

> "For every category: its single biggest earner, and how much of the
> category's revenue that one product represents."

Non-cancelled line revenue (`quantity * price`) per product, then per
category: the top product (revenue ties broken by product `id`). Columns
`category`, `product_id`, `name`, `revenue`, `cat_share_pct` =
`round(100.0 * revenue / category revenue, 1)`. **Ordered by `category`
ascending.** (6 rows.)

Edit `ex5/solution.sql`. Run: `uv run dojo test 111_drills_reports_3 ex5`

## Exercise 6 - how long between orders, typically?

> "One number: on average, how many days pass between a customer's
> consecutive orders?"

Gaps are per customer (`lag` over their orders by `created_at`, ties by
`id`), measured in whole days between `::date` values; first orders have
no gap and do not count. One row: `avg_gap_days` = the average gap rounded
to 1 decimal.

Edit `ex6/solution.sql`. Run: `uv run dojo test 111_drills_reports_3 ex6`

## Exercise 7 - revenue per buyer, where it means something

> "Rank countries by revenue per buyer - real revenue - but only where we
> have at least a hundred buyers, I do not want boutique noise."

Non-cancelled orders joined to customers. Columns `country`, `buyers`
(distinct customers), `revenue` = `sum(total)`, `per_buyer` =
`round(revenue / buyers, 2)`; keep countries with `buyers >= 100`.
**Ordered by `per_buyer` descending, then `country` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 111_drills_reports_3 ex7`

## Exercise 8 - the golden basket

> "Which category pairs actually get bought together? Same order, two
> different categories - count the orders, best pairs first."

Columns `cat_a`, `cat_b` (alphabetical within the pair: `cat_a < cat_b`),
`orders` = the number of **distinct orders** containing at least one line
from each. An order with three books lines and two toys lines is one
books-toys order. **Ordered by `orders` descending, then `cat_a`, then
`cat_b`.** (15 rows.)

Edit `ex8/solution.sql`. Run: `uv run dojo test 111_drills_reports_3 ex8`

## The gate

```python
"""Gates for 111_drills_reports_3. Quoted verbatim in README.md."""
from dojo import grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(shared_lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex2(shared_lesson_db):
    ex = L.exercise("ex2")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


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
    grader.assert_rows_equal(actual, expected)


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
compares rows. Exercises 1, 2 and 6 return a single row and are graded
unordered; the rest name an ordering and use `ordered=True`.

Next: **112_drills_mixed_1** - the gauntlets begin: every exercise mixes
two or three topics from the whole course.
