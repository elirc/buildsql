# 103 - Drills: regular expressions, set 1

Eight problems on PostgreSQL's POSIX regular expressions - the `~` family of
operators plus `substring`, `regexp_replace`, `regexp_match` and
`regexp_split_to_array`. Lesson 19 introduced pattern matching on this
dataset; here you test, extract, rewrite and split with patterns rather than
with positions.

Two rules of the road. `~` is case-sensitive and `~*` is not; `!~` is the
negation. And a pattern is anchored only where you say so - `'[0-9]+'`
matches a digit *anywhere* in the string, which is usually not the question
you meant to ask.

## Exercise 1 - does it match

For the customers with `id <= 20` return `id`, `email`, and `two_digit_id` =
a boolean, true when the address begins with `user` followed by exactly two
digits and then the `@`.

**Ordered by `id` ascending.** (20 rows.)

Edit `ex1/solution.sql`. Run: `uv run dojo test 103_drills_regex_1 ex1`

## Exercise 2 - the pattern as a filter

Return `id` and `email` for every customer whose whole address matches
`user` + exactly two digits + `@example.com` - anchored at both ends, with
the dot treated as a literal dot.

**Ordered by `id` ascending.** (90 rows.)

Edit `ex2/solution.sql`. Run: `uv run dojo test 103_drills_regex_1 ex2`

## Exercise 3 - pull out the number

Product names end in a number. For the products with `id <= 20` return `id`,
`name`, and `trailing_number` = that trailing run of digits, as text.

**Ordered by `id` ascending.** (20 rows.)

Edit `ex3/solution.sql`. Run: `uv run dojo test 103_drills_regex_1 ex3`

## Exercise 4 - take the number off

For the products with `id <= 20` return `id`, `name`, and `base_name` = the
name with the trailing number and the space before it removed - so
`Frost Puzzle 42` becomes `Frost Puzzle`.

**Ordered by `id` ascending.** (20 rows.)

Edit `ex4/solution.sql`. Run: `uv run dojo test 103_drills_regex_1 ex4`

## Exercise 5 - a case-insensitive census

For each product `category` return `category`, `products` = how many it has,
and `vowel_start` = how many of their names begin with a vowel, ignoring
case.

**Ordered by `category` ascending.** (6 rows.)

Edit `ex5/solution.sql`. Run: `uv run dojo test 103_drills_regex_1 ex5`

## Exercise 6 - strip the punctuation

Staff names sometimes carry titles and suffixes (`Dr. Barbara Collins PhD`).
For the staff with `id <= 30` return `id`, `name`, and `letters_only` = the
name with every character that is not a letter or a space removed.

**Ordered by `id` ascending.** (30 rows.)

Edit `ex6/solution.sql`. Run: `uv run dojo test 103_drills_regex_1 ex6`

## Exercise 7 - three captures at once

For the products with `id <= 20` return `id`, `adjective` = the first word,
`noun` = the second word, and `tag` = the trailing number as an `int`,
extracted with a single anchored pattern of three capture groups.

**Ordered by `id` ascending.** (20 rows.)

Edit `ex7/solution.sql`. Run: `uv run dojo test 103_drills_regex_1 ex7`

## Exercise 8 - the names that do not fit

Audit `staff` for names that are not exactly two plain alphabetic words.
Return `id`, `name`, and `parts` = how many space-separated pieces the name
has, for every member whose name does **not** match `^[A-Za-z]+ [A-Za-z]+$`.

**Ordered by `id` ascending.**

Edit `ex8/solution.sql`. Run: `uv run dojo test 103_drills_regex_1 ex8`

## The gate

```python
"""Gates for 103_drills_regex_1. Quoted verbatim in README.md."""
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

Next: **104_drills_jsonb_1**, on the `attributes` document attached to every
product.
