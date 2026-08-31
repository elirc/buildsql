# 59 - Drills: patterns and mixed predicates

The third `WHERE` set - lesson 02's pattern-matching half, plus the mixed
predicates that combine a pattern with a range or a list. `%` and `_` are the
whole vocabulary; knowing which of them you need is the whole skill. Redo 02
and 57 first if `LIKE` and `ILIKE` still feel interchangeable.

## Exercise 1 - an anchored prefix

Edit `ex1/solution.sql`. The Nova line is being discontinued. Every product
name is built as `<line> <item> <id>`, so the Nova products are the ones whose
`name` starts with `Nova ` (note the trailing space). Return three columns, in
this order: `id`, `name`, `category`. Any row order.

Run: `uv run dojo test 59_drills_where_3 ex1`

## Exercise 2 - a suffix

Edit `ex2/solution.sql`. The warehouse audits one tenth of the catalog by
checking every product whose `name` ends with the digit `7`. Return two
columns, in this order: `id`, `name`. Any row order.

Run: `uv run dojo test 59_drills_where_3 ex2`

## Exercise 3 - counting characters with underscore

Edit `ex3/solution.sql`. Support is investigating a batch of accounts created
in one run. Every email has the shape `user<id>@example.com`, and the batch is
the customers whose id has **exactly three digits and starts with a 2**.
Match that with `LIKE` and underscores - not with a numeric comparison on
`id`. Return two columns, in this order: `id`, `email`. Any row order.

Run: `uv run dojo test 59_drills_where_3 ex3`

## Exercise 4 - case-insensitive containment

Edit `ex4/solution.sql`. A supplier recall covers every blanket in the
catalog, and nobody trusts the capitalisation in the source spreadsheet.
Return every product whose `name` contains `blanket`,
matched **case-insensitively**. Three columns, in this order: `id`, `name`,
`price`. Any row order.

Run: `uv run dojo test 59_drills_where_3 ex4`

## Exercise 5 - excluding a pattern

Edit `ex5/solution.sql`. The toy department is re-listing everything except
the dolls. Return every product whose `category` is `toys` and whose `name`
does **not** contain `Doll` (matched case-sensitively). Two columns, in this
order: `id`, `name`. Any row order.

Run: `uv run dojo test 59_drills_where_3 ex5`

## Exercise 6 - a pattern and a range

Edit `ex6/solution.sql`. The Frost line's mid-price stock is going into a
bundle. Return every product whose `name` starts with `Frost ` and whose
`price` is between 100 and 200 inclusive. Three columns, in this order: `id`,
`name`, `price`. Any row order.

Run: `uv run dojo test 59_drills_where_3 ex6`

## Exercise 7 - two patterns and a threshold

Edit `ex7/solution.sql`. The premium electronics promo covers routers and
tablets only, above 400 dollars. Return every product whose `name` contains
`Router` **or** contains `Tablet`, **and** whose `price` is over 400. Four
columns, in this order: `id`, `name`, `category`, `price`. Any row order.

Run: `uv run dojo test 59_drills_where_3 ex7`

## Exercise 8 - a fixed-width pattern and an exclusion

Edit `ex8/solution.sql`. The very first cohort of signups is being surveyed,
minus our two biggest markets. Return every customer whose `email` matches
`user<two digits>@example.com` - exactly two digits - **and** whose `country`
is neither `US` nor `GB`. Three columns, in this order: `id`, `email`,
`country`. Any row order.

Run: `uv run dojo test 59_drills_where_3 ex8`

## The gate

```python
"""Gates for 59_drills_where_3. Quoted verbatim in README.md."""
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
compares the rows as an unordered multiset. Pattern bugs usually show up as
zero rows or as the whole table, so read the two counts in the failure
message first - they name the mistake.

## The teaching point

`LIKE` is not a search engine. It is a two-metacharacter matcher that reads
every row unless the pattern is anchored at the left, and it is exactly right
for structured text like an email address or a generated SKU. The moment you
find yourself writing `%term%` against user prose, you want full-text search
or a trigram index instead - lesson 41.

Next: **60_drills_order_limit_1** - putting rows in a defined order.
