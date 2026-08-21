# 47 — Capstone

Three exercises, no new concepts, production rules: you get a target,
the tools are everything from lessons 00–46, and the gate doesn't care
which of them you use. Completing this lesson completes the course.

## Exercise 1 — make the dashboard fast

`ex1/solution.sql` (provided) is the CFO's landing-page chart: paid
revenue per day, first week of October:

```sql
SELECT date_trunc('day', o.created_at) AS day,
       count(*) AS orders, sum(o.total) AS revenue
FROM orders o
WHERE o.status = 'paid'
  AND o.created_at >= '2023-10-01'
  AND o.created_at <  '2023-10-08'
GROUP BY 1;
```

Edit `ex1/indexes.sql` — anything you can justify. Gate: correct rows,
**no Seq Scan on `orders`**, and **≥5x**. Think before typing: which
predicates? equality or range? is a partial index honest here (lesson
39)? could covering columns buy an index-only scan (34)? Several
designs pass; measure two and keep notes like a professional.

Run: `uv run dojo test 47_capstone ex1`

## Exercise 2 — ship a schema change to a live table

Edit `ex2/solution.sql`. Product wants order channels. On `orders`
(500,000 live rows), with lesson-28 discipline end to end:

1. `channel` text column, backfilled to `'web'` for every existing
   row, NOT NULL at the end — the three-step.
2. CHECK constraint **named `orders_channel_ck`** allowing only
   `'web'`, `'mobile'`, `'phone'` — added NOT VALID, then VALIDATEd —
   the two-step.

The gate checks the end state *and* that the constraint really was
validated; a probe insert with channel `'carrier-pigeon'` must bounce.

Run: `uv run dojo test 47_capstone ex2`

## Exercise 3 — diagnose from the plan

A teammate pasted this plan for `ex3/solution.sql` (provided — the
"what did customer 4242 buy" report) and asked for help:

```
HashAggregate  (rows=12, 428ms)
  Hash Join  (rows=33, 425ms)
    Hash Join  (rows=33, 411ms)
      Seq Scan on order_items  (rows=1,000,000, 156ms)   <-- most expensive
      Hash  (rows=11)
        Seq Scan on orders  (rows=500,000, 118ms)
              Filter: (customer_id = 4242)
              Rows Removed by Filter: 499989
    Hash  (rows=10,000)
      Seq Scan on products  (rows=10,000, 3ms)
```

Read it like lesson 30 taught: eleven orders and twelve output rows,
yet two scans touch a **million and a half** rows to find them — both
`Rows Removed by Filter` and the fat `order_items` scan point at the
same two missing indexes (one of them is lesson 33's oldest friend).
Edit `ex3/indexes.sql` with the fix. Gate: no Seq Scan on `orders` or
`order_items`, 8x. (Products may scan — 10,000 rows into a hash is the
right call, and now you know why.)

Run: `uv run dojo test 47_capstone ex3`

## Exercise 4 — the product page's review widget

`ex4/solution.sql` (provided) is the query behind every product page's
"recent reviews" panel:

```sql
SELECT id, rating, created_at
FROM reviews
WHERE product_id = 42
ORDER BY created_at DESC
LIMIT 5;
```

Edit `ex4/indexes.sql`. The gate requires **no `Seq Scan`, no `Sort`**, and
at least 8×.

Two clauses, one index, and the sort is the part that matters: a `Sort`
node must consume its whole input before emitting a row, so it defeats the
`LIMIT` entirely. Get the ordering from the index and the plan reads five
entries and stops.

This is the single most valuable index shape in web applications — one
parent, most recent N children — and it is worth being able to write
without thinking.

Run: `uv run dojo test 47_capstone ex4`

## Exercise 5 — a second live migration, end to end

Edit `ex5/solution.sql`. The warehouse wants a printable SKU stored on
every product. On `products` (10,000 live rows), with lesson-28 discipline:

1. add a nullable `sku` text column;
2. backfill it, set-based, as `upper(left(category, 3)) || '-' || id::text`
   (lesson 04's expression);
3. flip it to `NOT NULL`;
4. add a **unique index** on it named exactly `products_sku_key`.

Four statements, in that order, and the order is the whole exercise. Add
the column `NOT NULL` up front and PostgreSQL rejects it — there are 10,000
existing rows with no value. Add the unique index before the backfill and
every row collides on NULL... except it does not, because NULLs are
distinct from each other in a unique index (lesson 25) — which is a trap
that would let a broken migration look fine.

The gate checks the column, its NOT NULL, the unique index by name, and
spot-checks that the values were actually computed rather than filled with
a constant.

Run: `uv run dojo test 47_capstone ex5`

## Exercise 6 — one more plan to read

A teammate is puzzled. They added an index on `orders.status` and the
planner refuses to use it:

```sql
EXPLAIN SELECT id, total FROM orders WHERE status = 'paid';
```

Run it in the lab (`dojo lab 47_capstone`) — with or without building that
index first; the answer does not change. Edit `ex6/solution.sql` to return
the node type PostgreSQL chooses for `orders`, as a single text value.

Then be able to say *why*, because that is the actual exercise. Roughly
250,000 of 500,000 orders are `paid`. Using an index would mean walking it
and then fetching half the table's rows one page at a time, in index order —
strictly more work than reading the table straight through. The planner is
not ignoring the index; it is costing it correctly and declining.

An index that goes unused is not always a missing statistic or a wrong
column order. Sometimes the query wants half the table, and no index can
make that cheap. That is what lesson 39's partial indexes and lesson 46's
materialized views are for.

Run: `uv run dojo test 47_capstone ex6`

## The gate

```python
"""Gates for 47_capstone. Quoted verbatim in README.md."""
import pytest

from dojo import catalog, db, grader, timing
from dojo.lesson import Lesson
from dojo.plan import explain

L = Lesson(__file__)


def _no_seq_scan_on(p, tables):
    offenders = [n.get("Relation Name") for n in p.nodes()
                 if n["Node Type"] == "Seq Scan"
                 and n.get("Relation Name") in tables]
    assert not offenders, (
        f"PLAN SHAPE: still sequential-scanning {offenders} - the fat node "
        "is the one to index.\n\nPlan:\n" + p.render()
    )


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex1",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    with db.connect(lesson_db.info.dbname, autocommit=True) as vconn:
        vconn.execute("VACUUM orders")
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    _no_seq_scan_on(p, {"orders"})  # customers may hash-join however it likes
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=5)


def test_ex2(lesson_db):
    existing = lesson_db.execute("SELECT count(*) FROM orders").fetchone()[0]
    ex = L.exercise("ex2")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "orders", {"channel": "text"})
    catalog.assert_not_null(lesson_db, "orders", "channel")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM orders WHERE channel = 'web'",
        existing, "every existing order backfilled to 'web'")
    grader.assert_scalar(
        lesson_db,
        "SELECT convalidated FROM pg_constraint WHERE conname = 'orders_channel_ck'",
        True, "orders_channel_ck exists and was VALIDATEd")
    catalog.rejects(
        lesson_db,
        "INSERT INTO orders (id, customer_id, status, total, created_at, channel) "
        "VALUES (900001, 1, 'pending', 10, '2023-11-15', 'carrier-pigeon')",
        why="channel must be one of web / mobile / phone")


def test_ex3(lesson_db):
    ex = L.exercise("ex3")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex3",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    _no_seq_scan_on(p, {"orders", "order_items"})
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


def test_ex4(lesson_db):
    ex = L.exercise("ex4")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex4",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=["Seq Scan", "Sort"])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


def test_ex5(lesson_db):
    ex = L.exercise("ex5")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    catalog.assert_table(lesson_db, "products", {"sku": "text"})
    catalog.assert_not_null(lesson_db, "products", "sku")
    catalog.assert_unique(lesson_db, "products", ["sku"])
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM pg_class WHERE relname = 'products_sku_key'",
        1, "the unique index is named products_sku_key")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM products "
        "WHERE sku <> upper(left(category, 3)) || '-' || id::text",
        0, "every SKU is computed from that product's own category and id")
    catalog.rejects(
        lesson_db,
        "INSERT INTO products (id, name, category, price, description, "
        "attributes, sku) SELECT 99001, 'Probe', 'books', 1.00, 'x', "
        "'{}'::jsonb, sku FROM products WHERE id = 1",
        why="two products may not share a SKU")


def test_ex6(lesson_db):
    ex = L.exercise("ex6")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
```

## The teaching point

You have completed SQL Dojo. The through-line, if one sentence must
carry it: **the database will always tell you what it's doing — the
craft is asking, reading the answer, and changing exactly one
justified thing at a time.** That loop — hypothesis, EXPLAIN,
measurement, restraint — is what you actually trained here, and it
transfers to every engine, every ORM, every incident channel you'll
ever be paged into. Keep the reflexes; `dojo review` will quiz the
syntax.
