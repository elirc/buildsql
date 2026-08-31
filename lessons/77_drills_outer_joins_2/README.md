# 77 - Drills: outer joins 2 (ON vs WHERE)

Eight problems on the one line of SQL that changes an outer join back into an
inner one, plus the shapes that grow out of it: filtered aggregates, joining
to a joined result, and the full outer join. This set drills lesson 09; ex1
and ex2 are the same data asked two ways, so do them in order.

## Exercise 1

Every customer in country `AU`, with how many of their orders were
**cancelled**. Customers with no cancelled orders - and customers with no
orders at all - must appear with `0`. Columns, in this order: `id`, `name`,
`cancelled`.

**Ordered by `id` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 77_drills_outer_joins_2 ex1`

## Exercise 2

The opposite requirement, same data. Only customers in country `AU` who have
**at least one** cancelled order, with how many they have. Columns, in this
order: `id`, `name`, `cancelled`.

**Ordered by `id` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 77_drills_outer_joins_2 ex2`

## Exercise 3

One pass, three measures. For every customer in country `AU`: how many orders
they have in total, how many of those were cancelled, and their revenue from
the orders that were **not** cancelled. Customers with no orders report `0`,
`0` and `0`. Columns, in this order: `id`, `name`, `orders`, `cancelled`,
`revenue`.

**Ordered by `id` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 77_drills_outer_joins_2 ex3`

## Exercise 4

For every order belonging to a customer with `id <= 3`: the order's `id`,
its `status`, and the `name` of each line's product **where that product is
priced above 400**. An order with no such line appears exactly once, with
NULL in the product column. Columns, in this order: `id`, `status`,
`product`.

**Ordered by the order's `id` ascending, then `product` ascending with NULLs
first.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 77_drills_outer_joins_2 ex4`

## Exercise 5

For every customer in country `IN` who signed up on or after `2023-08-01`:
how many of their orders are `paid` and how many are `cancelled`. Zeros
included, and customers with no orders at all still appear. Columns, in this
order: `id`, `name`, `paid`, `cancelled`.

**Ordered by `id` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 77_drills_outer_joins_2 ex5`

## Exercise 6

Per category: how many products it contains, and how many of those products
have **never appeared on any order line**. Columns, in this order:
`category`, `products`, `never_ordered`.

**Ordered by `category` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 77_drills_outer_joins_2 ex6`

## Exercise 7

For every `toys` product priced above 490, look only at order lines with
`quantity = 5` that belong to orders **created on or after 2023-11-01**, and
split their units two ways: `good_units` from orders that are not cancelled,
`lost_units` from orders that are. Every one of those products appears, with
`0` where there is nothing to count. Columns, in this order: `id`, `name`,
`good_units`, `lost_units`.

**Ordered by `id` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 77_drills_outer_joins_2 ex7`

## Exercise 8

The last two days of the dataset, from both sides. Consider units sold on
order lines whose **order** was created on or after `2023-11-13`, and 5-star
reviews created on or after `2023-11-13`. Return one row per product that
appears in **either** of those two sets. Columns, in this order:
`product_id`, `units` (`0` if it sold nothing in the window), `praises` (`0`
if it got no 5-star review in the window), and `bucket` - the text `both`,
`sales only`, or `praise only`.

**Ordered by `product_id` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 77_drills_outer_joins_2 ex8`

## The gate

```python
"""Gates for 77_drills_outer_joins_2. Quoted verbatim in README.md."""
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
compares the rows **in order**. Exercises 1 and 2 differ only in whether a
predicate sits in `ON` or `WHERE`, so if one of them passes and the other
returns a suspiciously similar row count, you have written the same query
twice.

Next: **`78_drills_anti_semi_1`**.
