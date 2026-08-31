# 63 - Drills: building strings

Eight problems on the text half of lesson 04: `lower` and `upper`, `left` and
`right`, `replace`, `split_part`, `coalesce`, `lpad`, and the `||` operator
that glues them together. Redo 04 if the cast in `id::text` is still a
mystery.

## Exercise 1 - case folding

Edit `ex1/solution.sql`. The search index stores everything lower-cased.
Return two columns, in this order: `id`, and the product `name` in lower
case. Every product, any row order.

Run: `uv run dojo test 63_drills_expressions_2 ex1`

## Exercise 2 - a placeholder for the missing manager

Edit `ex2/solution.sql`. The org-chart export is a text file and has no way
to write a missing manager. Return three columns, in this order: `id`,
`name`, and the `manager_id` **as text**, with the missing one replaced by
the literal `ROOT`. All staff, any row order.

Run: `uv run dojo test 63_drills_expressions_2 ex2`

## Exercise 3 - both ends of a string

Edit `ex3/solution.sql`. A label printer wants a fixed-width prefix and
suffix of every product name. Return three columns, in this order: `id`, the
**first six** characters of `name`, and the **last four** characters of
`name`. Every product, any row order.

Run: `uv run dojo test 63_drills_expressions_2 ex3`

## Exercise 4 - splitting a name

Edit `ex4/solution.sql`. The badge printer needs the two parts of each staff
name separately, split on the space. Return four columns, in this order:
`id`, `name`, the part **before** the first space, and the part **after** it.
Use `split_part`. All staff, any row order.

Some names carry a title or a suffix, so the second part is not always a
surname. Return what the split gives you.

Run: `uv run dojo test 63_drills_expressions_2 ex4`

## Exercise 5 - a URL slug

Edit `ex5/solution.sql`. The storefront needs a slug for every product: the
`name`, lower-cased, with every space replaced by a hyphen. `Frost Puzzle
4242` becomes `frost-puzzle-4242`. Return two columns, in this order: `id`,
and the slug. Every product, any row order.

Run: `uv run dojo test 63_drills_expressions_2 ex5`

## Exercise 6 - pulling the id back out of an email

Edit `ex6/solution.sql`. Every address has the shape `user<id>@example.com`
and a migration script needs the id back as text. Return three columns, in
this order: `id`, `email`, and the digits from the local part - so
`user4242@example.com` yields `4242`. Any row order.

Run: `uv run dojo test 63_drills_expressions_2 ex6`

## Exercise 7 - a corporate email address

Edit `ex7/solution.sql`. IT is provisioning accounts as
`<first>.<second>@corp.example`, all lower case, where `<first>` and
`<second>` are the first two space-separated parts of the staff `name`.
`Karen Welch` becomes `karen.welch@corp.example`. Return three columns, in
this order: `id`, `name`, and the address. All staff, any row order.

Run: `uv run dojo test 63_drills_expressions_2 ex7`

## Exercise 8 - the warehouse SKU

Edit `ex8/solution.sql`. The warehouse label is three fields joined by
hyphens: the first three letters of the `category` in **upper** case, then
the `id` padded with leading zeros to **six** characters, then the `name`
lower-cased with spaces replaced by underscores. Product 7 - `Swift Novel 7`
in `food` - gets `FOO-000007-swift_novel_7`.

Return two columns, in this order: `id`, and the label. Every product, any
row order.

Run: `uv run dojo test 63_drills_expressions_2 ex8`

## The gate

```python
"""Gates for 63_drills_expressions_2. Quoted verbatim in README.md."""
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
compares the rows as an unordered multiset. String comparison is exact - one
missing separator, one stray capital, one space in the wrong place and the
row differs, which is precisely the discipline these drills exist to build.

## The teaching point

Building display strings in SQL means every consumer - the export, the
dashboard, the invoice PDF - agrees on the format, instead of three services
each reimplementing the same slug rule slightly differently. The catch is
that string handling has no type checker: a missing separator produces a
perfectly valid string that is wrong, so the only defence is looking at the
output.

Next: **64_drills_case_1** - conditional expressions.
