# 19 — Text and JSONB

Two column types carry *structure inside the value*: strings ("the
username is the part before the @") and JSONB documents
(`products.attributes` holds `{"color": ..., "size": ..., "tags":
[...]}`). This lesson is the read-side toolbox for both. In Part 5,
lessons 41–42 return here with indexes — today is about correctness.

## Concept

**Text surgery:**

```sql
split_part(email, '@', 1)        -- 'user4242@example.com' -> 'user4242'
position('@' IN email)           -- 1-based offset, 0 if absent
substring(email FROM 1 FOR 4)    -- 'user'
name ~ 'son$'                    -- regex match (case-sensitive; ~* insensitive)
regexp_replace(name, '\s+', ' ', 'g')
```

**JSONB navigation** (against `attributes`):

```sql
attributes ->  'tags'            -- extract as JSONB  (arrow keeps the type)
attributes ->> 'color'           -- extract as TEXT   (double-arrow casts out)
attributes @> '{"color": "red"}' -- containment: does the left side contain
                                 -- the right-side structure?
jsonb_array_elements_text(attributes -> 'tags')  -- one row per array element
```

The `->` vs `->>` distinction causes 90% of beginner JSONB bugs:
`attributes -> 'color' = 'red'` fails (JSONB vs text); either compare
with `->>`, or compare JSONB to JSONB: `-> 'color' = '"red"'::jsonb`
(note the inner quotes!).

`@>` (containment) is the idiomatic "does this document have this
shape" test — `{"tags": ["eco"]}` reads as "tags contains eco". It also
happens to be the operator GIN indexes accelerate (lesson 42 — remember
you wrote this query un-indexed today).

## Exercise 1 — usernames

Edit `ex1/solution.sql`. For customers with `id <= 100`: their `id` and
the part of their email before the `@`, aliased `username`. Any order.

Run: `uv run dojo test 19_text_jsonb ex1`

## Exercise 2 — red XL hunting

Edit `ex2/solution.sql`. Products whose attributes say color `red` AND
size `xl`. Columns: `id`, `name`. Any order. Use `->>` twice (or one
`@>` with a two-key document — both pass; write the one you find
clearer, read the other in the hints). (512 rows.)

Run: `uv run dojo test 19_text_jsonb ex2`

## Exercise 3 — tagged eco

Edit `ex3/solution.sql`. Products whose `tags` array contains `'eco'`.
Columns: `id`, `name`. Any order. Use the containment operator `@>` —
this is its home turf. (2,079 rows.)

Run: `uv run dojo test 19_text_jsonb ex3`

## Challenge — the tag census (optional)

Edit `challenge/solution.sql`. How many products carry each tag? Explode
every product's `tags` array into rows with
`jsonb_array_elements_text`, then group. Columns: `tag`, `products`
(count). Any order. (10 tags; each product has exactly 2.)

Run: `uv run dojo test 19_text_jsonb challenge`

## Spaced review

`review1/`: high-value purchases from the clickstream: events of type
`'purchase'` whose payload `value` exceeds 995. Columns: `id`, `value`
(as int). Any order. (`payload ->> 'value'` is text; cast before
comparing — text comparison would put '996' < '99'!)

## The gate

```python
"""Gates for 19_text_jsonb. Quoted verbatim in README.md."""
import pytest

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


@pytest.mark.challenge
def test_challenge(shared_lesson_db):
    ex = L.exercise("challenge")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


@pytest.mark.review
def test_review1(shared_lesson_db):
    ex = L.exercise("review1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
```

## The teaching point

JSONB earns its keep for *genuinely* variable attributes — merchandising
tags, third-party payloads, form blobs. It gets abused as "schema
avoidance": entire orders stored as documents, then queried with `->>`
chains that no constraint protects and no type checks. The design smell
test (Part 4 formalizes it): if you know the keys in advance and query
them constantly, they're columns. If they vary by row and you mostly
store-and-fetch, JSONB is honest.

Next: **20_querying_capstone** — Part 2's graduation project.
