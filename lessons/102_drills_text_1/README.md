# 102 - Drills: text functions, set 1

Eight problems on the string half of lesson 19: measuring, padding,
locating, formatting and assembling text. No regular expressions here - they
get their own set in 103 - just the everyday functions that turn a column
into a label, a key, or a report line. Lessons 04 and 63 introduced most of
them; this set combines them.

## Exercise 1 - measure and shout

For the products with `id <= 20` return `id`, `name`, `name_len` = the
number of characters in `name`, and `cat` = the category in upper case.

**Ordered by `id` ascending.** (20 rows.)

Edit `ex1/solution.sql`. Run: `uv run dojo test 102_drills_text_1 ex1`

## Exercise 2 - tidy and pad

For the staff with `id <= 20` return `id`, `name`, `pretty` = the name in
title case (every word capitalised, the rest lower case), and `padded` = the
name padded on the right with dots to exactly 30 characters.

**Ordered by `id` ascending.** (20 rows.)

Edit `ex2/solution.sql`. Run: `uv run dojo test 102_drills_text_1 ex2`

## Exercise 3 - find the marker

For the customers with `id <= 20` return `id`, `email`, `at_pos` = the
1-based position of the `@` in the address, and `domain_len` = the number of
characters after the `@`.

**Ordered by `id` ascending.** (20 rows.)

Edit `ex3/solution.sql`. Run: `uv run dojo test 102_drills_text_1 ex3`

## Exercise 4 - one line per product

For the products with `id <= 15` return `id` and `label`, a single text
column reading exactly `NAME (CATEGORY) costs PRICE` - for example
`Frost Puzzle 42 (toys) costs 199.99`.

**Ordered by `id` ascending.** (15 rows.)

Edit `ex4/solution.sql`. Run: `uv run dojo test 102_drills_text_1 ex4`

## Exercise 5 - a list in a cell

Among the products with `id <= 60`, return one row per `category`:
`category`, `products` = how many of them it has, and `names` = their names
joined into one string with `, ` between them, **in ascending `id` order**.

**Ordered by `category` ascending.**

Edit `ex5/solution.sql`. Run: `uv run dojo test 102_drills_text_1 ex5`

## Exercise 6 - money as text

For the staff with `id <= 20` return `id`, `name`, `salary`, and
`salary_text` = the salary rendered with exactly two decimals and no leading
spaces, for example `78292.00`.

**Ordered by `id` ascending.** (20 rows.)

Edit `ex6/solution.sql`. Run: `uv run dojo test 102_drills_text_1 ex6`

## Exercise 7 - mask the address

For the customers with `id <= 30` return `id`, `email`, and `masked` = the
address with everything between the first character and the `@` replaced by
one `*` per hidden character - so `user1@example.com` becomes
`u****@example.com`.

The length must not change.

**Ordered by `id` ascending.** (30 rows.)

Edit `ex7/solution.sql`. Run: `uv run dojo test 102_drills_text_1 ex7`

## Exercise 8 - the commonest first word

Product names are three words: an adjective, a noun and a number. Return the
five commonest adjectives across the whole `products` table as `adjective`
and `products` = how many product names start with it.

**Ordered by `products` descending, then `adjective` ascending**, five rows.

Edit `ex8/solution.sql`. Run: `uv run dojo test 102_drills_text_1 ex8`

## The gate

```python
"""Gates for 102_drills_text_1. Quoted verbatim in README.md."""
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
compares rows. All eight prompts name an ordering, so all eight are graded
with `ordered=True`.

Next: **103_drills_regex_1**, the same material with patterns instead of
positions.
