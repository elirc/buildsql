# 41 — GIN and full-text search

"Find reviews that mention *excellent* and *battery*." The B-tree has
nothing to offer: `LIKE '%excellent%'` can't use one (no left anchor to
descend on — lesson 33's prefix rule at the character level), so it's
a sequential scan evaluating a substring match a million times. Worse,
LIKE doesn't even answer the real question — it matches `excellently`,
misses `Excellent.` vs case... Text search is a different *problem*,
and PostgreSQL ships a different index family for it: **GIN**
(Generalized Inverted Index) — for each word, the list of rows
containing it. Exactly how a book index works.

## Concept

```sql
SELECT to_tsvector('english', 'The battery life is excellent.');
-- 'batteri':2 'excel':5 'life':3            <- stemmed, stopwords dropped

SELECT to_tsvector('english', body) @@ to_tsquery('english', 'excellent & battery');
-- @@ means "document matches query"

CREATE INDEX reviews_body_fts_idx
  ON reviews USING gin (to_tsvector('english', body));
```

- `to_tsvector` normalizes a document: lowercase, **stemming**
  (`excellent` → `excel`, so *excellently* matches too), stopword
  removal, positions. `to_tsquery` does the same to your query and
  supports `&`, `|`, `!`, `<->` (phrase).
- The index is lesson 40's trick with a different access method:
  `USING gin` over the *expression* `to_tsvector('english', body)`.
  The query must spell the same expression, config name included.
- Ranking: `ts_rank(vector, query)` scores matches; order by it for
  "best first". The index finds; ranking still computes per *match* —
  cheap when matches are few.
- Heads-up: building GIN over a million review bodies takes ~a minute,
  and the first (un-indexed) baseline run of ex1 takes several seconds
  — the gate will feel slow once, then the baseline is cached.

## Exercise 1 — index the corpus

`ex1/solution.sql` (provided):

```sql
SELECT id
FROM reviews
WHERE to_tsvector('english', body) @@ to_tsquery('english', 'excellent & battery');
```

Edit `ex1/indexes.sql`: the GIN index from the concept block. Baseline:
a full-corpus tsvector evaluation. Yours: an inverted-index lookup.
This is the biggest single speedup in the course.

Run: `uv run dojo test 41_gin_fulltext ex1`

## Exercise 2 — rank the results

`ex2/solution.sql` (provided) — top five *durable* reviews:

```sql
SELECT id
FROM reviews
WHERE to_tsvector('english', body) @@ to_tsquery('english', 'durable')
ORDER BY ts_rank(to_tsvector('english', body),
                 to_tsquery('english', 'durable')) DESC, id
LIMIT 5;
```

Edit `ex2/indexes.sql` (same GIN index). Gate: correct rows + no Seq
Scan. Notice in `dojo plan`: the index finds the matches; the rank is
computed only for them.

Run: `uv run dojo test 41_gin_fulltext ex2`

## Exercise 3 — a query written by a human

`ex3/solution.sql` (provided) searches the same corpus, but the query
comes from a search box rather than from a developer:

```sql
SELECT id
FROM reviews
WHERE to_tsvector('english', body)
      @@ plainto_tsquery('english', 'durable battery');
```

Edit `ex3/indexes.sql` with the same GIN index as exercise 1.

`to_tsquery` demands operator syntax — `'durable & battery'` — and raises a
syntax error on anything else, which makes it completely unsuitable for
user input. `plainto_tsquery` takes arbitrary text, normalises it, and ANDs
the terms together. It never raises on punctuation, quotes or stray
ampersands.

The three query-builders are worth knowing apart: `to_tsquery` for
developer-written expressions, `plainto_tsquery` for plain user text,
`websearch_to_tsquery` for search-engine syntax. Exercise 4 uses the
third.

Run: `uv run dojo test 41_gin_fulltext ex3`

## Exercise 4 — search-engine syntax

`ex4/solution.sql` (provided):

```sql
SELECT id
FROM reviews
WHERE to_tsvector('english', body)
      @@ websearch_to_tsquery('english', 'excellent OR durable');
```

Edit `ex4/indexes.sql` — the same GIN index again.

`websearch_to_tsquery` understands the syntax people actually type into
search boxes: `"quoted phrases"`, `OR`, and `-excluded`. Everything else is
treated as literal text, so it can never raise a syntax error on user
input.

Three exercises, one index. That is the point worth taking away: the index
is over the *left* side of `@@` — the document — and it serves every query
you can express against it. You do not build an index per search term; you
build one index over the corpus.

Run: `uv run dojo test 41_gin_fulltext ex4`

## The gate

```python
"""Gates for 41_gin_fulltext. Quoted verbatim in README.md.

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


def test_ex3(lesson_db):
    ex = L.exercise("ex3")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex3",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=['Seq Scan'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


def test_ex4(lesson_db):
    ex = L.exercise("ex4")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex4",
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

The decision every team eventually faces: PostgreSQL full-text vs a
dedicated search engine. The honest answer: tsvector+GIN handles
"search our reviews/tickets/docs" for a very long time — one system,
transactional, no sync pipeline. Elsewhere-search earns its keep at
typo-tolerance, faceting, and relevance tuning. The expensive mistake
is neither choice — it's shipping `LIKE '%term%'` to production and
calling it search. Now you never will.

Next: **42_gin_jsonb** — the same index family, pointed at documents.
