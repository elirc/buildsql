# 76 - Drills: outer joins 1 (keeping the empty rows)

Eight problems on the rows that are not there: customers who never ordered,
orders with no lines, products nobody has complained about this month. This
set drills lesson 09 - `LEFT`/`RIGHT`, NULL-extension, and the difference
between counting rows and counting values. Redo 09 first if `count(*)`
returning 1 for an empty group is a surprise.

## Exercise 1

Every customer in country `ES`, with how many orders they have placed -
including the ones who have placed none. Columns, in this order: `id`,
`name`, `orders`.

**Ordered by `id` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 76_drills_outer_joins_1 ex1`

## Exercise 2

Every order with `id <= 300`, whether or not it has any line items. Columns,
in this order: `id`, `total`, `lines` (how many order lines it has),
`units` (the sum of their quantities). An order with no lines must report
`0` for both, not NULL.

**Ordered by `id` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 76_drills_outer_joins_1 ex2`

## Exercise 3

No aggregation here - look at the raw shape. Every customer in country `ES`
who signed up on or after `2023-10-01`, paired with each of their orders.
A customer with no orders appears exactly once, with NULLs on the order side.
Columns, in this order: the customer's `id`, the customer's `name`,
`order_id`, `total`.

**Ordered by customer `id` ascending, then `order_id` ascending with NULLs
first.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 76_drills_outer_joins_1 ex3`

## Exercise 4

Same idea from the other side. Every `garden` product priced above 480, with
the number of **5-star reviews it received on or after 2023-11-10** - zero
included. Write this one with `reviews` as the left table and `products` as
the right table, so the join keyword you need is `RIGHT JOIN`. Columns, in
this order: `id`, `name`, `late_five_star`.

**Ordered by `id` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 76_drills_outer_joins_1 ex4`

## Exercise 5

Every order placed on or after `2023-11-01` by a customer in country `MX`,
with how many of that order's lines had `quantity = 5` - zero included.
Columns, in this order: the order's `id`, `total`, `big_lines`.

**Ordered by the order's `id` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 76_drills_outer_joins_1 ex5`

## Exercise 6

The bug and the fix, side by side. For every customer in country `CA` who
signed up on or after `2023-09-01`, join to their orders **with total above
1900** and report two counts of the same group: `rows_returned` must be
`count(*)`, and `big_orders` must count only the orders that actually
matched. Customers with no such order must show `1` and `0` respectively.
Columns, in this order: `id`, `name`, `rows_returned`, `big_orders`.

**Ordered by `id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 76_drills_outer_joins_1 ex6`

## Exercise 7

Every customer in country `BR` who signed up on or after `2023-06-01`, with
how many orders they have placed and how many units they have bought in
total across all those orders' lines. Customers with no orders report `0`
and `0`. Columns, in this order: `id`, `name`, `orders`, `units`.

**Ordered by `id` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 76_drills_outer_joins_1 ex7`

## Exercise 8

For every `toys` product priced above 495: how many order lines sold it in a
quantity of exactly 5, and how many 1-star reviews it received on or after
`2023-11-01`. Both counts are `0` where there is nothing to count, and no
product may be dropped. Columns, in this order: `id`, `name`, `big_lines`,
`recent_one_star`.

**Ordered by `id` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 76_drills_outer_joins_1 ex8`

## The gate

```python
"""Gates for 76_drills_outer_joins_1. Quoted verbatim in README.md."""
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
compares the rows **in order**. Every prompt here names an ordering, and
several of them name where the NULLs go - an outer join that returns the
right values in the wrong place is still wrong.

Next: **`77_drills_outer_joins_2`**.
