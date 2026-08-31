# 104 - Drills: jsonb, set 1

Eight problems on the `attributes` document every product carries - a small
`jsonb` object with a `color`, a `size`, and a `tags` array of two labels.
Lesson 19 introduced `->`, `->>` and containment; this set adds the path
operators, key and element existence, the functions that expand a document
into rows, and the ones that build a document back up.

Keep the two arrow operators straight: `->` returns `jsonb` (so it can be
chained), `->>` returns `text` (so it can be compared to a string, cast, or
grouped). Nearly every jsonb bug is one of them where the other belonged.

## Exercise 1 - two fields, two shapes

For the products with `id <= 20` return `id`, `size` = the `size` attribute
as text, and `tag_count` = the number of elements in the `tags` array, as an
`int`.

**Ordered by `id` ascending.** (20 rows.)

Edit `ex1/solution.sql`. Run: `uv run dojo test 104_drills_jsonb_1 ex1`

## Exercise 2 - a census on a document field

Return one row per distinct `size`: `size` (as text) and `products` = how
many products carry it.

**Ordered by `size` ascending.** (4 rows.)

Edit `ex2/solution.sql`. Run: `uv run dojo test 104_drills_jsonb_1 ex2`

## Exercise 3 - reaching in by path

For the products with `id <= 20` return `id`, `first_tag` = the first
element of `tags` as **text**, and `tags` = the whole `tags` array as
**jsonb**.

Use the path operators `#>` and `#>>` for at least one of the two columns.

**Ordered by `id` ascending.** (20 rows.)

Edit `ex3/solution.sql`. Run: `uv run dojo test 104_drills_jsonb_1 ex3`

## Exercise 4 - does the array contain it

Return `id` and `name` for every product with `id <= 200` whose `tags` array
contains the label `premium`.

**Ordered by `id` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 104_drills_jsonb_1 ex4`

## Exercise 5 - the document as rows

For the products with `id <= 10`, expand the attributes into one row per
key, **excluding** the `tags` array. Return `id`, `key`, and `value`, both
as text.

**Ordered by `id` ascending, then `key` ascending.** (20 rows.)

Edit `ex5/solution.sql`. Run: `uv run dojo test 104_drills_jsonb_1 ex5`

## Exercise 6 - build a document

For the products with `id <= 10` return `id` and `doc` = a `jsonb` object
with exactly three keys: `name` (the product name), `price` (the price as a
JSON number), and `color` (the colour attribute as a JSON string).

**Ordered by `id` ascending.** (10 rows.)

Edit `ex6/solution.sql`. Run: `uv run dojo test 104_drills_jsonb_1 ex6`

## Exercise 7 - a JSON array per group

Among the products with `id <= 30`, return one row per `category`:
`category`, `products` = how many there are, and `names` = a `jsonb` array
of their names **in ascending `id` order**.

**Ordered by `category` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 104_drills_jsonb_1 ex7`

## Exercise 8 - a pivot over a document field

Return one row per `color`: `color` (as text), `products` = how many
products have it, `on_sale` = how many of those also carry the `sale` tag,
and `pct_sale` = `round(100.0 * on_sale / products, 1)`.

**Ordered by `color` ascending.** (5 rows.)

Edit `ex8/solution.sql`. Run: `uv run dojo test 104_drills_jsonb_1 ex8`

## The gate

```python
"""Gates for 104_drills_jsonb_1. Quoted verbatim in README.md."""
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
with `ordered=True`. The jsonb columns are compared by value, so the key
order inside a document does not matter - `jsonb` does not preserve it in
the first place.

Next: **105_drills_jsonb_2**, on the heavier document work.
