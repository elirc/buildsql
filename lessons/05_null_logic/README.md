# 05 — NULL: three-valued logic

Exactly one row in this whole database has a NULL in it on purpose: the
CEO's `manager_id` in `staff`. One NULL is all it takes. NULL is not zero,
not empty string, not "unknown value that acts like a value" — it's SQL's
marker for *absent*, and every comparison with it returns neither true nor
false but **unknown**. WHERE keeps only rows where the condition is *true*,
so unknown rows silently vanish. That rule, applied consistently, produces
some famously surprising behavior — today you meet it in a controlled
environment instead of a 2 a.m. incident.

## Concept

```sql
NULL = NULL      -- unknown, not true!
NULL <> 5        -- unknown
NOT (unknown)    -- still unknown
```

- To test for NULL: `IS NULL` / `IS NOT NULL`. Never `= NULL`.
- `IS DISTINCT FROM` is `<>` that treats NULL as a comparable value:
  `NULL IS DISTINCT FROM 5` is true, `NULL IS DISTINCT FROM NULL` is false.
  Use it when NULLs must count as "different" (or "same") instead of
  "unknown".
- Aggregates skip NULLs (`count(manager_id)` counts only non-NULL — lesson
  06 makes this precise).
- **The `NOT IN` trap**, this lesson's boss fight: if the list inside
  `NOT IN (...)` contains even one NULL, the whole condition can never be
  true for any row, and you get **zero rows** with no error and no warning.
  Why: `x NOT IN (a, b, NULL)` means `x <> a AND x <> b AND x <> NULL`, and
  that last comparison is unknown, which poisons the AND.

One preview: `NOT IN` can take a subquery — `id NOT IN (SELECT manager_id
FROM staff)` means "id is not in that column's values". Subqueries proper
are lesson 13; you only need this one-line form today.

## Exercise 1 — find the CEO

Edit `ex1/solution.sql`. Return the one staff member with no manager.
Columns: `id`, `name`. One row.

Run: `uv run dojo test 05_null_logic ex1`

## Exercise 2 — the NOT IN trap

Edit `ex2/solution.sql`. HR wants every **individual contributor** — staff
who manage nobody, i.e. whose `id` never appears in the `manager_id`
column. Columns: `id`, `name`. Any order. (Most of the company qualifies.)

The "obvious" query is:

```sql
SELECT id, name FROM staff
WHERE id NOT IN (SELECT manager_id FROM staff);
```

Run it in the lab. **Zero rows.** The CEO's NULL `manager_id` is in that
list, and one NULL poisons `NOT IN` completely. Your job: make it work —
filter the NULL out *inside* the list (`WHERE manager_id IS NOT NULL`).
(Lesson 13 will show you `NOT EXISTS`, which shrugs NULLs off entirely.)

Run: `uv run dojo test 05_null_logic ex2`

## Challenge — IS DISTINCT FROM (optional)

Edit `challenge/solution.sql`. Return every staff member whose
`manager_id` **IS DISTINCT FROM 1** — i.e. everyone who does *not* report
directly to the CEO (id 1), **including the CEO herself**, whose NULL would
be dropped by a plain `<> 1`. Columns: `id`, `name`. Any order.

Try it with `<> 1` first in the lab and count the rows — you'll be exactly
one short. That missing row is the entire point of `IS DISTINCT FROM`.

Run: `uv run dojo test 05_null_logic challenge`

## Spaced review

`review1/`: every **finance** staff member who *has* a manager — columns
`id`, `name`, any order. (Two conditions; one of them is a NULL test.)

## The gate

```python
"""Gates for 05_null_logic. Quoted verbatim in README.md."""
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

The production version of today's trap: `WHERE user_id NOT IN (SELECT
banned_id FROM bans)` returns nothing because one bans row has a NULL —
and suddenly no user can log in, or worse, *every* user passes a security
filter written the other way around. Seasoned reviewers flag `NOT IN
(subquery)` on sight and ask: can that column be NULL? The safe idioms are
`NOT EXISTS` (lesson 13) or an explicit `IS NOT NULL` inside the list.

Next: **06_aggregates** — collapsing many rows into one answer.
