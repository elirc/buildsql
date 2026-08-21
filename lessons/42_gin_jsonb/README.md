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

## Exercise 3 — two keys at once

`ex3/solution.sql` (provided) finds a specific variant:

```sql
SELECT id, name
FROM products
WHERE attributes @> '{"color": "red", "size": "xl"}';
```

Edit `ex3/indexes.sql` with a GIN index on the whole `attributes` column.

One containment test, two keys, one index — and note what you did *not*
have to do: name the keys when creating the index. A GIN index over a JSONB
column indexes every key and value in every document, so it serves
containment queries for combinations nobody anticipated. That generality is
its entire selling point over lesson 40's expression index, which serves
exactly one expression and nothing else.

The price is size and write cost: a GIN index over a document column is
typically several times larger than a B-tree over one extracted key.

This gate checks your rows and that the index exists — it does **not**
demand a particular plan, and that is deliberate. `products` has only ten
thousand rows, and on a table that small a sequential scan is often the
cheapest plan even with a perfect index available. Insisting on an index
scan here would be asserting a fact about the table's size rather than about
your index. Exercise 4 makes the same point on three million rows, where the
planner has no such luxury.

Run: `uv run dojo test 42_gin_jsonb ex3`

## Exercise 4 — the smaller operator class

`ex4/solution.sql` (provided) searches three million clickstream
payloads:

```sql
SELECT id, ts
FROM events
WHERE payload @> '{"value": 999}';
```

Edit `ex4/indexes.sql` and build the GIN index with the
**`jsonb_path_ops`** operator class:

```sql
CREATE INDEX ... ON events USING gin (payload jsonb_path_ops);
```

The default operator class, `jsonb_ops`, indexes every key *and* every
value separately, which lets it serve key-existence operators (`?`, `?|`,
`?&`) as well as containment. `jsonb_path_ops` indexes only hashes of
complete paths — so it supports `@>` and nothing else, and in exchange it
is substantially smaller and often faster for the containment queries that
are most of what anyone actually runs.

Choosing an operator class is the most PostgreSQL-specific thing in Part 5,
and the principle generalises: an index is a data structure plus a set of
operators it can answer. Match both to your query.

Run: `uv run dojo test 42_gin_jsonb ex4`

## The gate

```python
"""Gates for 42_gin_jsonb. Quoted verbatim in README.md.

Part 5's three-stage gate: correct rows -> right plan shape -> fast enough
against this machine's own cached baseline (data/baseline.json).
"""
import pytest

from dojo import catalog, db, grader, timing
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


def test_ex3(lesson_db):
    """Rows and index only. `products` is small enough that a sequential scan
    is a legitimate plan here, so asserting one shape would be asserting a
    fact about the table size rather than about your index."""
    ex = L.exercise("ex3")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    ex.apply_indexes(lesson_db)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    catalog.assert_index(lesson_db, "products", ["attributes"])


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

The jsonb-column lifecycle in production: it starts as "flexible
extras", then one key becomes load-bearing, queries pile onto it, and
someone adds a GIN over the whole column — 10x bigger than needed and
slow to write. The craft is matching index to question: `@>` on the
whole document → GIN (path_ops if that's all); hot *scalar* field →
expression B-tree on the extraction; hot enough to constrain → promote
it to a real column (lesson 19's smell test, closing the loop). JSONB
is schema you haven't admitted to yet; index it like you mean it.

Next: **43_gist_brin** — indexes for data with physical shape.
