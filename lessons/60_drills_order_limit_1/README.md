# 60 - Drills: ORDER BY and LIMIT

Eight problems on lesson 03: sort keys, sort directions, and taking the top N
of a defined order. Every prompt here names its full ordering including the
tie-break, and every gate compares your rows **in sequence** - so a right
answer in the wrong order is a failure. Redo 03 if that sounds harsh.

## Exercise 1 - the longest-serving staff

Edit `ex1/solution.sql`. HR is planning service awards. Return the **ten
longest-serving** members of `staff` - the earliest `hired_on` first. Three
columns, in this order: `id`, `name`, `hired_on`.

**Ordered by `hired_on` ascending, then `id` ascending.** Ten rows.

Run: `uv run dojo test 60_drills_order_limit_1 ex1`

## Exercise 2 - sorting text

Edit `ex2/solution.sql`. The catalog index page starts with the first ten
products in alphabetical order by `name`. Three columns, in this order: `id`,
`name`, `category`.

**Ordered by `name` ascending, then `id` ascending.** Ten rows.

Run: `uv run dojo test 60_drills_order_limit_1 ex2`

## Exercise 3 - grouped alphabetically by country

Edit `ex3/solution.sql`. The account-review spreadsheet lists customers
country by country, alphabetically by name inside each country. Return the
first twenty rows of that listing. Three columns, in this order: `id`,
`name`, `country`.

**Ordered by `country` ascending, then `name` ascending, then `id`
ascending.** Twenty rows.

Run: `uv run dojo test 60_drills_order_limit_1 ex3`

## Exercise 4 - the newest reviews

Edit `ex4/solution.sql`. The moderation queue shows the ten most recent
reviews. Four columns, in this order: `id`, `product_id`, `rating`,
`created_at`.

**Ordered by `created_at` descending, then `id` descending.** Ten rows.

Run: `uv run dojo test 60_drills_order_limit_1 ex4`

## Exercise 5 - the second page

Edit `ex5/solution.sql`. The premium catalog is paginated twenty-five
products to a page, most expensive first. Return **page two** - that is, skip
the first twenty-five rows of the ordering and return the next twenty-five.
Three columns, in this order: `id`, `name`, `price`.

**Ordered by `price` descending, then `id` ascending.** Twenty-five rows.

Run: `uv run dojo test 60_drills_order_limit_1 ex5`

## Exercise 6 - newest hire in each department

Edit `ex6/solution.sql`. The onboarding report walks the departments
alphabetically and, inside each, lists the most recently hired first. Return
the first twenty-five rows of that listing. Four columns, in this order:
`id`, `name`, `department`, `hired_on`.

**Ordered by `department` ascending, then `hired_on` descending, then `id`
ascending.** Twenty-five rows.

Run: `uv run dojo test 60_drills_order_limit_1 ex6`

## Exercise 7 - sorting by an expression

Edit `ex7/solution.sql`. Pricing suspects the catalog is full of
psychological prices and wants to see the biggest cents values. Sort products
by the **fractional part of the price** - the expression `price % 1` -
largest first. Three columns, in this order: `id`, `name`, `price`.

**Ordered by `price % 1` descending, then `id` ascending.** Twenty rows.

Run: `uv run dojo test 60_drills_order_limit_1 ex7`

## Exercise 8 - three keys, mixed, on a large table

Edit `ex8/solution.sql`. The retention team reads the customer list from the
last country alphabetically backwards, oldest signups first inside each
country. Return the first thirty rows. Four columns, in this order: `id`,
`name`, `country`, `created_at`.

**Ordered by `country` descending, then `created_at` ascending, then `id`
ascending.** Thirty rows.

Run: `uv run dojo test 60_drills_order_limit_1 ex8`

## The gate

```python
"""Gates for 60_drills_order_limit_1. Quoted verbatim in README.md."""
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

Every gate in this lesson passes `ordered=True`, so the reference rows and
yours are compared position by position. The failure message distinguishes
"right rows, wrong order" from "wrong rows" - read the first line before you
start rewriting, because the two mean very different things.

## The teaching point

`LIMIT` without a total order is not a query, it is a sample. The database is
free to return any N rows that satisfy an under-specified `ORDER BY`, and it
will happily return different ones after a vacuum, a new index, or a
parallel plan. Ending every sort key list with something unique is not
pedantry; it is the difference between a report and a rumour.

Next: **61_drills_order_limit_2** - pagination, NULL placement, and sorting
by things you did not select.
