# 42 — GIN over JSONB

Lesson 19 left a debt: you queried `products.attributes` and
`events.payload` with `@>` containment, un-indexed — seq scans
evaluating JSONB predicates row by row. GIN pays it. The same inverted
index that mapped words → reviews can map **keys and values → rows**:
`"tags": "eco"` becomes an index entry exactly like a word did.

## Concept

```sql
CREATE INDEX products_attributes_idx
  ON products USING gin (attributes);

-- or, tuned for containment only:
CREATE INDEX events_payload_idx
  ON events USING gin (payload jsonb_path_ops);
```

- Plain `gin (col)` (the `jsonb_ops` default) indexes every key and
  every value separately; it supports `@>`, `?` (key exists), `?|`,
  `?&`.
- `jsonb_path_ops` indexes *hashed paths* (key-chain + value): only
  supports `@>` — but the index is substantially smaller and faster
  for it. Choosing it is you telling the database "containment is the
  only question I ask this column". For a 3-million-row clickstream,
  that trade is obviously right.
- What GIN doesn't accelerate: `payload ->> 'value' > 995`-style
  *range* predicates on extracted fields. For those, lesson 40 already
  gave you the answer — a B-tree **expression index** on
  `((payload ->> 'value')::int)`. Different question, different tree.
- Build cost is real: GIN on the events payloads takes on the order of
  a minute. Feel it once here, budget for it forever after.

## Exercise 1 — tag containment

`ex1/solution.sql` (provided) — every product tagged both `eco` and
`limited`:

```sql
SELECT id
FROM products
WHERE attributes @> '{"tags": ["eco", "limited"]}';
```

Edit `ex1/indexes.sql`: a GIN index on `attributes` (plain ops are
fine here — merchandising also asks `?`-style questions).

Run: `uv run dojo test 42_gin_jsonb ex1`

## Exercise 2 — needle in the clickstream

`ex2/solution.sql` (provided) — every event that touched product 4242's
page:

```sql
SELECT id
FROM events
WHERE payload @> '{"path": "/p/4242"}';
```

Edit `ex2/indexes.sql` — use `jsonb_path_ops`, and expect the build to
take a minute (3M payloads). ~300 rows out of 3,000,000: this is GIN's
home game.

Run: `uv run dojo test 42_gin_jsonb ex2`

## The gate

```python
"""Gates for 42_gin_jsonb. Quoted verbatim in README.md.

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
    grader.assert_faster_than_baseline(measured, baseline, ratio=5)


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

The jsonb-column lifecycle in production: it starts as "flexible
extras", then one key becomes load-bearing, queries pile onto it, and
someone adds a GIN over the whole column — 10x bigger than needed and
slow to write. The craft is matching index to question: `@>` on the
whole document → GIN (path_ops if that's all); hot *scalar* field →
expression B-tree on the extraction; hot enough to constrain → promote
it to a real column (lesson 19's smell test, closing the loop). JSONB
is schema you haven't admitted to yet; index it like you mean it.

Next: **43_gist_brin** — indexes for data with physical shape.
