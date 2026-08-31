# 56 - Drills: projection under pressure

The second set on lesson 01's material: longer SELECT lists, expressions that
feed other expressions, and `DISTINCT` over columns that are nearly unique.
Redo 55 first if the shape of these problems is unfamiliar - this set assumes
the basics are already automatic.

## Exercise 1 - a four-column export

Edit `ex1/solution.sql`. HR wants a headcount export. Return four columns, in
this order: `department`, `name`, `hired_on`, `salary`. All staff, any row
order.

Run: `uv run dojo test 56_drills_select_2 ex1`

## Exercise 2 - reordering a wide table

Edit `ex2/solution.sql`. The CRM import expects country first. Return three
columns, in this order: `country`, `id`, `email`. Every customer, any row
order.

Run: `uv run dojo test 56_drills_select_2 ex2`

## Exercise 3 - prices in cents

Edit `ex3/solution.sql`. The payments API takes integer minor units. Return
three columns, in this order: `id`, `price`, and `price * 100`. Do not round
or cast - the multiplication is the whole answer. Every product, any row
order.

Run: `uv run dojo test 56_drills_select_2 ex3`

## Exercise 4 - which products have ever sold

Edit `ex4/solution.sql`. Merchandising is auditing dead stock. Return one
column - the distinct `product_id` values that appear in `order_items` - with
no duplicates. Any row order.

Run: `uv run dojo test 56_drills_select_2 ex4`

## Exercise 5 - the rating combinations that occur

Edit `ex5/solution.sql`. Before building a rating histogram per product, the
analyst wants to know which (product, rating) combinations exist at all.
Return two columns, in this order: `product_id` and `rating`, with duplicate
pairs removed. Any row order.

Run: `uv run dojo test 56_drills_select_2 ex5`

## Exercise 6 - a coupon that can go negative

Edit `ex6/solution.sql`. Marketing wants to see what a flat five-dollar
coupon does to the catalog. Return three columns, in this order: `id`,
`price`, and `price - 5`. Do not clamp the result at zero - the point of the
exercise is to see the negatives. Every product, any row order.

Run: `uv run dojo test 56_drills_select_2 ex6`

## Exercise 7 - brackets change the answer

Edit `ex7/solution.sql`. A five percent markup was implemented twice, once
with brackets in the wrong place, and finance wants both figures side by side.
Return four columns, in this order: `id`, `price`, `price + price * 0.05`,
and `(price + price) * 0.05`. Write both expressions exactly as given. Every
product, any row order.

Run: `uv run dojo test 56_drills_select_2 ex7`

## Exercise 8 - the payroll worksheet

Edit `ex8/solution.sql`. Build the full payroll worksheet in one pass. Return
seven columns, in this order:

| position | value |
|---|---|
| 1 | `id` |
| 2 | `name` |
| 3 | `department` |
| 4 | `salary` |
| 5 | `salary / 12` (monthly, unrounded) |
| 6 | `salary * 0.15` (bonus) |
| 7 | `salary + salary * 0.15` (total package) |

All staff, any row order.

Run: `uv run dojo test 56_drills_select_2 ex8`

## The gate

```python
"""Gates for 56_drills_select_2. Quoted verbatim in README.md."""
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
    grader.assert_rows_equal(actual, expected)


def test_ex4(shared_lesson_db):
    ex = L.exercise("ex4")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex5(shared_lesson_db):
    ex = L.exercise("ex5")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex6(shared_lesson_db):
    ex = L.exercise("ex6")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex7(shared_lesson_db):
    ex = L.exercise("ex7")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex8(shared_lesson_db):
    ex = L.exercise("ex8")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
```

Each gate runs the reference query and yours against the same clone and
compares the rows as an unordered multiset. Column order matters and column
names do not, so read the column list in the prompt twice before you run.

## The teaching point

Real report queries have SELECT lists ten columns wide, half of them
computed, and the reviewer's only defence is that the list reads in the order
the spec asked for. Writing the columns in the requested sequence, and
computing derived values once in SQL rather than three times downstream, is
most of what "good projection" means in production.

Next: **57_drills_where_1** - narrowing the rows instead of shaping them.
