# 75 - Drills: inner joins 3 (long paths)

Eight problems on the long way round - three, four and five tables chained
into a single path, plus the two things that go wrong once a query has more
than one join: the same table needed twice, and a measure that gets counted
twice. This set drills lesson 08; if the two-table form is still effortful,
redo 08 before you start here.

## Exercise 1

Everything customer 88 has ever bought. Columns, in this order:
`order_id`, `product` (the product name), `quantity`.

**Ordered by `order_id` ascending, then product name ascending, then
`quantity` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 75_drills_inner_joins_3 ex1`

## Exercise 2

Every order line that sold an `electronics` product priced above 490, with
the status of the order the line belongs to. Columns, in this order: the
order line's `id`, `product` (the product name), `status`, `quantity`.

**Ordered by the order line's `id` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 75_drills_inner_joins_3 ex2`

## Exercise 3

Units and revenue per category for orders **created in October 2023**
(`created_at >= '2023-10-01'` and `< '2023-11-01'`). Columns, in this order:
`category`, `units` (the sum of line quantities), `revenue` (the sum of
`quantity * price` **taken from the order line**, not from the product).

**Ordered by `category` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 75_drills_inner_joins_3 ex3`

## Exercise 4

Who bought the expensive garden stock? Every order line for a `garden`
product priced above 495, with the buyer attached. Columns, in this order:
the order line's `id`, `product` (product name), `customer` (customer name),
`country`, `quantity`.

**Ordered by the order line's `id` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 75_drills_inner_joins_3 ex4`

## Exercise 5

Revenue on `books` per customer country, counting only orders that are
**not cancelled** and were created **on or after 2023-10-01**. Revenue is the
sum of `quantity * price` from the order line. Columns, in this order:
`country`, `revenue`.

**Ordered by `revenue` descending, then `country` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 75_drills_inner_joins_3 ex5`

## Exercise 6

Orders created **on or after 2023-11-01** that contain at least one `books`
product **and** at least one `electronics` product. One row per order.
Columns, in this order: the order's `id`, `status`, `total`.

**Ordered by the order's `id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 75_drills_inner_joins_3 ex6`

## Exercise 7

Customer 17 wants to know what other people think of the things he has
bought. Return every **1-star** review written about any product customer 17
has ever ordered - by anybody, not just by him - with each review appearing
once. Columns, in this order: the product's `id`, the product's `name`, the
review's `id`, the review's `created_at`.

**Ordered by product `id` ascending, then review `id` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 75_drills_inner_joins_3 ex7`

## Exercise 8

An `electronics` buying report for Japan. For every `electronics` product
bought by customers in country `JP` on an order created in **October 2023**
(`>= '2023-10-01'` and `< '2023-11-01'`), report the product, how many
distinct JP customers bought it in that window, how many units they bought in
total, and how many reviews the product has **overall** (all ratings, all
time, from anyone). Keep only products with **at least 2 distinct JP
buyers**. Columns, in this order: the product's `id`, `name`, `buyers`,
`units`, `reviews`.

**Ordered by `units` descending, then product `id` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 75_drills_inner_joins_3 ex8`

## The gate

```python
"""Gates for 75_drills_inner_joins_3. Quoted verbatim in README.md."""
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
compares the rows **in order**, because every prompt in this set names an
ordering. As shipped, each `solution.sql` is `SELECT 1;`, so the first run
fails with a column mismatch - that is the known-good starting state.

Next: **`76_drills_outer_joins_1`**.
