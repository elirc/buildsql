# 40 — Expression indexes

`WHERE lower(email) = '...'` — the case-insensitive login lookup that
every application ships — can never use an index on `email`. The index
stores `'User4242@Example.com'`-shaped values; the query searches for
what a *function of* the column returns. Postgres's fix is direct:
index the **expression itself**.

## Concept

```sql
CREATE INDEX customers_email_lower_idx ON customers (lower(email));
```

- The index stores precomputed `lower(email)` for every row; the
  planner uses it when the query's predicate contains **that exact
  expression** (syntactically — `lower(email)`, not `LOWER(c.email)`
  spelled through an alias it can't see through, and not
  `upper(email)`).
- Only **IMMUTABLE** expressions qualify — same input, same output,
  forever. `lower(text)`, `split_part(...)`, arithmetic: fine.
  `now()`-relative things or timezone-dependent casts: refused with
  `functions in index expression must be marked IMMUTABLE` (a message
  that has taught many people what immutability means).
- One more freshness rule (lesson 36 rings again): expression indexes
  bring their *own statistics* on the expression's values — collected
  at the next ANALYZE. The dojo template's stats are fresh; production
  bulk loads want an ANALYZE after building one.

## Exercise 1 — the login lookup

`ex1/solution.sql` (provided):

```sql
SELECT id, email
FROM customers
WHERE lower(email) = 'user4242@example.com';
```

Edit `ex1/indexes.sql`. (The seed's emails are already lowercase — the
*data* doesn't need lower(); the *query* says it anyway, as real login
code must, and the index must match the query.)

Run: `uv run dojo test 40_expression_indexes ex1`

## Exercise 2 — index a computed prefix

`ex2/solution.sql` (provided) revisits lesson 19's username surgery:

```sql
SELECT id, email
FROM customers
WHERE split_part(email, '@', 1) = 'user777';
```

Edit `ex2/indexes.sql` — same principle, chunkier expression. Spell it
in the DDL exactly as the query spells it.

Run: `uv run dojo test 40_expression_indexes ex2`

## The gate

```python
"""Gates for 40_expression_indexes. Quoted verbatim in README.md.

Part 5's three-stage gate: correct rows -> right plan shape -> fast enough
against this machine's own cached baseline (data/baseline.json).
"""
import pytest

from dojo import db, grader, timing
from dojo.lesson import Lesson
from dojo.plan import explain

L = Lesson(__file__)


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex1",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=['Seq Scan'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


def test_ex2(lesson_db):
    ex = L.exercise("ex2")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex2",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=['Seq Scan'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)
```

## The teaching point

Expression indexes formalize a deal between query and schema: *this
computed form of the data is a first-class lookup key*. The
alternative — a stored, triggered, or generated column — is sometimes
better (visible in SELECT *, usable by more tools); PostgreSQL's
`GENERATED ALWAYS AS (...) STORED` plus a plain index is the modern
spelling of that alternative. Either way, the review question is the
same: does every query that wants this lookup spell the expression
identically? Grep before you promise.

Next: **41_gin_fulltext** — when B-trees stop being the right tree.
