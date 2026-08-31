# 105 - Drills: JSONB, set 2

Eight problems that take lesson 19's JSONB toolbox to the `events` stream:
every event carries a `payload` like `{"path": "/p/1234", "value": 618}`, and
every product still carries its `attributes` document. If `->` versus `->>`,
containment with `@>`, or `jsonb_array_elements_text` feel shaky, reread
lesson 19 before starting - this set assumes all three.

## Exercise 1 - the path out of the payload

For the events with `id <= 15`, return `id` and `path` = the payload's `path`
key, as text.

**Ordered by `id` ascending.** (15 rows.)

Edit `ex1/solution.sql`. Run: `uv run dojo test 105_drills_jsonb_2 ex1`

## Exercise 2 - the number inside the path

Every path has the shape `/p/<product id>`. For the events with `id <= 25`,
return `id` and `product_id` = the id embedded in the path, **as an
integer**, not text.

**Ordered by `id` ascending.** (25 rows.)

Edit `ex2/solution.sql`. Run: `uv run dojo test 105_drills_jsonb_2 ex2`

## Exercise 3 - payloads pinned at the ceiling

The payload's `value` runs from 0 to 1000. How many events hit exactly 1000?
Return one row, one column `hits`. Write the condition as a containment test
(`@>`) - the extract-and-cast version is in the hints, and it is worth having
written both at least once.

Edit `ex3/solution.sql`. Run: `uv run dojo test 105_drills_jsonb_2 ex3`

## Exercise 4 - the average value per event type

For each `event_type`, return `event_type` and `avg_value` = the average of
the payload's `value`, rounded to 1 decimal place. Remember what `->>`
returns: text averages badly.

**Ordered by `event_type` ascending.** (5 rows.)

Edit `ex4/solution.sql`. Run: `uv run dojo test 105_drills_jsonb_2 ex4`

## Exercise 5 - the garden tag report

For `garden` products only: explode the `tags` array and return one row per
`tag` with `products` = how many garden products carry it and `avg_price` =
their average price rounded to 2 decimal places.

**Ordered by `tag` ascending.** (10 rows - every tag shows up in garden.)

Edit `ex5/solution.sql`. Run: `uv run dojo test 105_drills_jsonb_2 ex5`

## Exercise 6 - the value histogram

Bucket every event by its payload `value` into bands of 100: `band` =
`(value as int) / 100` with integer division (0-99 is band 0, 100-199 is
band 1, ... and the exact value 1000 sits alone in band 10). Per band:
`band`, `events` = how many events landed there, `customers` = how many
distinct customers produced them.

**Ordered by `band` ascending.** (11 rows.)

Edit `ex6/solution.sql`. Run: `uv run dojo test 105_drills_jsonb_2 ex6`

## Exercise 7 - the ten busiest product pages

Every `view` event's path names a product page. Return the ten most-viewed
products: `product_id` (parsed out of the path), `name` (from `products`),
and `views` = how many view events landed there.

**Ordered by `views` descending, then `product_id` ascending, limited to
ten rows** - view counts sit close together, so the tie-break decides who
makes the list.

Edit `ex7/solution.sql`. Run: `uv run dojo test 105_drills_jsonb_2 ex7`

## Exercise 8 - which tags travel together

Every product carries exactly two distinct tags - one unordered pair per
product. Count the pairs across the catalogue: `tag_a`, `tag_b` (with
`tag_a` alphabetically before `tag_b`), and `products` = how many products
carry exactly that pair.

**Ordered by `products` descending, then `tag_a`, then `tag_b`.** (45 rows -
every pair of the ten tags occurs.)

Edit `ex8/solution.sql`. Run: `uv run dojo test 105_drills_jsonb_2 ex8`

## The gate

```python
"""Gates for 105_drills_jsonb_2. Quoted verbatim in README.md."""
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
    grader.assert_rows_equal(actual, expected)


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
compares rows. Exercise 3 returns a single row, so it is graded unordered;
every other prompt names an ordering and is graded with `ordered=True`.

Next: **106_drills_lateral_1** - a per-group LIMIT that actually runs per
group.
