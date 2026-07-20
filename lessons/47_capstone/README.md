# 47 — Capstone

Three exercises, no new concepts, production rules: you get a target,
the tools are everything from lessons 00–46, and the gate doesn't care
which of them you use. Completing this lesson completes the course.

## Exercise 1 — make the dashboard fast

`ex1/solution.sql` (provided) is the CFO's landing-page query:

```sql
SELECT c.country, count(*) AS orders, sum(o.total) AS revenue
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'paid'
  AND o.created_at >= '2023-10-01'
  AND o.created_at <  '2023-11-01'
GROUP BY c.country;
```

Edit `ex1/indexes.sql` — anything you can justify. Gate: correct rows,
**no Seq Scan on `orders`** (the customers side may do as the planner
pleases — lesson 37 taught you why), and **≥5x**. Think before typing:
which predicates? equality or range? is a partial index honest here
(lesson 39)? could covering columns buy an index-only scan (34)?
Several designs pass; measure two and keep notes like a professional.

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
    ex = L.exercise("ex2")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "orders", {"channel": "text"})
    catalog.assert_not_null(lesson_db, "orders", "channel")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM orders WHERE channel = 'web'",
        500000, "every existing order backfilled to 'web'")
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
