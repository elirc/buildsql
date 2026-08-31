# 61 - Drills: pagination, NULLs, and hidden sort keys

The second set on lesson 03. Same clause, harder corners: where NULLs land,
how to page deep into a result, and sorting by a column you did not select.
Every gate compares rows **in sequence**. Redo 60 first if any of its eight
still needs a hint.

## Exercise 1 - category listing, priciest first

Edit `ex1/solution.sql`. The buyer's worksheet walks the categories
alphabetically and lists the most expensive product first inside each.
Return the first eighteen rows. Four columns, in this order: `category`,
`id`, `name`, `price`.

**Ordered by `category` ascending, then `price` descending, then `id`
ascending.** Eighteen rows.

Run: `uv run dojo test 61_drills_order_limit_2 ex1`

## Exercise 2 - the five highest paid

Edit `ex2/solution.sql`. Compensation review starts at the top: the five
highest-paid members of `staff`. Four columns, in this order: `id`, `name`,
`department`, `salary`.

**Ordered by `salary` descending, then `id` ascending.** Five rows.

Run: `uv run dojo test 61_drills_order_limit_2 ex2`

## Exercise 3 - deciding where the NULL goes

Edit `ex3/solution.sql`. The org-chart importer reads managers from the
highest `manager_id` downwards and wants the one person with no manager at
the **end** of the listing, not the start. Return the first twelve rows.
Three columns, in this order: `id`, `name`, `manager_id`.

**Ordered by `manager_id` descending with NULLs last, then `id` ascending.**
Twelve rows.

Run: `uv run dojo test 61_drills_order_limit_2 ex3`

## Exercise 4 - page three of the directory

Edit `ex4/solution.sql`. The customer directory is paginated twenty rows to a
page, alphabetically by `name`. Return **page three**: skip the first forty
rows and return the next twenty. Three columns, in this order: `id`, `name`,
`country`.

**Ordered by `name` ascending, then `id` ascending.** Twenty rows.

Run: `uv run dojo test 61_drills_order_limit_2 ex4`

## Exercise 5 - the latest cancellations

Edit `ex5/solution.sql`. Support wants the ten most recent cancelled orders.
Filter to `status = 'cancelled'` and take the newest first. Three columns, in
this order: `id`, `customer_id`, `created_at`.

**Ordered by `created_at` descending, then `id` descending.** Ten rows.

Run: `uv run dojo test 61_drills_order_limit_2 ex5`

## Exercise 6 - sorting by a column you did not select

Edit `ex6/solution.sql`. The gift-guide layout only has room for the id and
the name, but the order must still be by price, most expensive first. Return
**two** columns, in this order: `id`, `name` - and no price column.

**Ordered by `price` descending, then `id` ascending.** Fifteen rows.

Run: `uv run dojo test 61_drills_order_limit_2 ex6`

## Exercise 7 - NULLs plus a second key

Edit `ex7/solution.sql`. The reporting-line audit groups people by their
manager, lowest `manager_id` first, with the unmanaged person at the very
end; inside each manager, the best paid first. Return the first twenty rows.
Four columns, in this order: `id`, `name`, `manager_id`, `salary`.

**Ordered by `manager_id` ascending with NULLs last, then `salary`
descending, then `id` ascending.** Twenty rows.

Run: `uv run dojo test 61_drills_order_limit_2 ex7`

## Exercise 8 - deep into a three-key listing

Edit `ex8/solution.sql`. The lifecycle team reads customers country by
country alphabetically, newest signups first inside each country, and has
already worked through the first hundred rows. Return the next twenty-five.
Four columns, in this order: `id`, `name`, `country`, `created_at`.

**Ordered by `country` ascending, then `created_at` descending, then `id`
ascending; skip 100 rows and return 25.**

Run: `uv run dojo test 61_drills_order_limit_2 ex8`

## The gate

```python
"""Gates for 61_drills_order_limit_2. Quoted verbatim in README.md."""
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

Every gate in this lesson passes `ordered=True`, so your rows are compared
position by position against the reference. "RIGHT ROWS, WRONG ORDER" in the
failure message means the `WHERE` and `LIMIT` are correct and only the
`ORDER BY` needs attention - that is a much smaller fix than it looks.

## The teaching point

Two things separate a sort you can ship from one you cannot: it is total, and
it says out loud where the NULLs go. Both are one extra clause. Neither is
optional in a report somebody will diff week over week, because a sort that
is merely *usually* stable produces a diff full of phantom changes and
destroys trust in the report.

Next: **62_drills_expressions_1** - computing the values rather than
arranging them.
