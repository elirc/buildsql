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
