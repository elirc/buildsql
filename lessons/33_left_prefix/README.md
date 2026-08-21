# 33 — Left prefixes and the unindexed-FK trap

An index on `(a, b)` is sorted by `a` first — so for a query on `b`
alone it's as useful as a phone book when you only know someone's first
name. This "left prefix rule" sounds academic until you meet its most
expensive real-world incarnation: **foreign keys**.

Here's the trap. PostgreSQL auto-indexes primary keys (it must — the
index *is* the uniqueness enforcement). It does **not** auto-index
foreign key columns. `order_items.order_id` references `orders(id)` —
and in this database, like every fresh schema, it has no index. Every
"items of order X" lookup — the single most natural query in the schema
— seq-scans a million rows. So does every `DELETE FROM orders`
(checking for referencing children!). Entire consulting careers are
funded by this default.

## Concept

```sql
-- serves order_id-alone AND (order_id, product_id):
CREATE INDEX order_items_order_id_idx ON order_items (order_id);

-- (order_id, product_id) does NOT serve product_id alone:
--   the product_id values are scattered across all order_id groups
```

Checklist form of the prefix rule for an index on `(a, b, c)`:

| predicate | served? |
|---|---|
| `a = ?` | yes |
| `a = ? AND b = ?` | yes |
| `a = ? AND b = ? AND c = ?` | yes |
| `b = ?` | **no** (not a left prefix) |
| `b = ? AND c = ?` | **no** |
| `a = ? AND c = ?` | partially (descends on `a`, filters `c` in-index) |

## Exercise 1 — index the FK

`ex1/solution.sql` (provided) is the receipt query from lesson 08:

```sql
SELECT product_id, quantity, price
FROM order_items
WHERE order_id = 123;
```

Edit `ex1/indexes.sql`. One index; a million-row Seq Scan becomes a
three-row fetch.

Run: `uv run dojo test 33_left_prefix ex1`

## Exercise 2 — the prefix rule, felt

`ex2/indexes.sql` comes **pre-filled** with a composite:

```sql
CREATE INDEX order_items_order_product_idx
  ON order_items (order_id, product_id);
```

`ex2/solution.sql` (provided) asks the *other* FK question:

```sql
SELECT count(*)
FROM order_items
WHERE product_id = 4242;
```

Run the gate once before touching anything — Seq Scan, despite
`product_id` being "in an index". It's not a *left prefix*, so the
index can't serve it. Now **add** (don't remove the composite — it
represents someone else's query you mustn't break) the index this
predicate needs.

Run: `uv run dojo test 33_left_prefix ex2`

## Exercise 3 — the whole key

`ex3/solution.sql` (provided) asks the clickstream a two-part question:

```sql
SELECT id, ts, payload
FROM events
WHERE customer_id = 4242 AND event_type = 'purchase';
```

Edit `ex3/indexes.sql` with one composite index over both columns, the
selective one leading.

Three million rows, two equality conditions, and the index narrows on both
in one walk. This is the case composite indexes exist for — and the
baseline it is measured against is a full scan of the largest table in the
database, so the difference is not subtle.

Run: `uv run dojo test 33_left_prefix ex3`

## Exercise 4 — half the key is still a key

`ex4/solution.sql` (provided) asks for **everything** one customer did:

```sql
SELECT id, event_type, ts
FROM events
WHERE customer_id = 4242;
```

Edit `ex4/indexes.sql` and build **the same two-column index as exercise
3** — `(customer_id, event_type)` — not a single-column one.

This is the half of the prefix rule that works, and it is worth proving to
yourself: a query on the *leading* column alone uses the composite index
happily, because the entries are sorted by `customer_id` first. Exercise 2
showed the other half — the trailing column alone gets nothing.

The practical consequence is that `(a, b)` makes a separate index on `(a)`
redundant. Every prefix of a composite index is free; every suffix costs a
second index.

Run: `uv run dojo test 33_left_prefix ex4`

## The gate

```python
"""Gates for 33_left_prefix. Quoted verbatim in README.md.

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

Two habits from one lesson. First: **when you write a FK, decide about
its index in the same breath** — the answer is almost always yes (skip
only append-heavy tables whose parents are never deleted and never
joined from). Second: "column X is indexed" is not a sentence that
means anything — *predicates* are served or not, and only left prefixes
count. Reviewers who internalize this catch entire classes of
regression before deploy.

Next: **34_index_only_scans** — when the index alone can answer.
