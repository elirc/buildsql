# 45 — Declarative partitioning

At 3 million rows, `events` is manageable. At 3 billion, single-table
life ends: indexes outgrow memory, VACUUM takes days (lesson 44's
race, lost), and deleting last year's data means a months-long DELETE
that bloats everything it touches. **Partitioning** splits one logical
table into physical children along a key — for event streams, always
time — so every maintenance operation and most queries deal with one
manageable slice.

## Concept

```sql
CREATE TABLE events_p (LIKE events) PARTITION BY RANGE (ts);

CREATE TABLE events_p_oct PARTITION OF events_p
  FOR VALUES FROM ('2023-10-01') TO ('2023-11-01');

CREATE TABLE events_p_nov PARTITION OF events_p
  FOR VALUES FROM ('2023-11-01') TO ('2023-12-01');

INSERT INTO events_p SELECT * FROM events;   -- rows route themselves
```

- The parent is a shell (`relkind 'p'` in the catalog — the gate
  checks); rows live in partitions, and inserts route automatically by
  partition key. Ranges are half-open — `FROM` inclusive, `TO`
  exclusive — the idiom you've used since lesson 12, now structural.
- **Partition pruning** is the query-side payoff: `WHERE ts >=
  '2023-11-01' AND ts < '2023-11-08'` provably can't match October, so
  the October partition is *never opened*. EXPLAIN shows only the
  surviving partitions. Pruning needs the WHERE to constrain the
  partition key with expressions the planner can reason about — hide
  `ts` inside a function call and you scan everything.
- The operational payoff is even bigger: expiring old data becomes
  `DROP TABLE events_p_oct` — instant, no bloat, no VACUUM debt.
  Indexes are per-partition (create on the parent; children inherit),
  so each stays small.

## Exercise 1 — build it

Edit `ex1/solution.sql`: the concept block's four statements — parent
partitioned by RANGE on `ts`, the two monthly partitions with those
exact names (`events_p_oct`, `events_p_nov` — the gate checks pruning
by name), and the INSERT. Copying 3M rows takes ~half a minute; that's
the honest cost of re-homing data.

Run: `uv run dojo test 45_partitioning ex1`

## Exercise 2 — see the pruning

`ex2/solution.sql` — the first week of November, from the partitioned
copy (copy it in):

```sql
SELECT count(*)
FROM events_p
WHERE ts >= '2023-11-01'
  AND ts < '2023-11-08';
```

The gate EXPLAINs it and **fails if the October partition appears in
the plan**. No indexes anywhere — the pruning alone is the win being
graded.

Run: `uv run dojo test 45_partitioning ex2`

## The gate

```python
"""Gates for 45_partitioning. Quoted verbatim in README.md."""
from dojo import grader
from dojo.lesson import Lesson
from dojo.plan import explain

L = Lesson(__file__)


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    grader.assert_scalar(
        lesson_db,
        "SELECT relkind = 'p' FROM pg_class WHERE relname = 'events_p'",
        True, "events_p is a PARTITIONED table (relkind 'p'), not a plain one")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) >= 2 FROM pg_inherits i "
        "JOIN pg_class parent ON parent.oid = i.inhparent "
        "WHERE parent.relname = 'events_p'",
        True, "events_p has at least two partitions attached")
    grader.assert_scalar(
        lesson_db,
        "SELECT (SELECT count(*) FROM events_p) = (SELECT count(*) FROM events)",
        True, "every event made it into the partitioned copy")


def test_ex2(lesson_db):
    lesson_db.execute(L.exercise("ex1").solution_sql)
    lesson_db.commit()
    ex = L.exercise("ex2")
    expected = lesson_db.execute(
        "SELECT count(*) FROM events "
        "WHERE ts >= '2023-11-01' AND ts < '2023-11-08'").fetchall()
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)

    p = explain(lesson_db, ex.solution_sql)
    scanned = [n.get("Relation Name") for n in p.nodes() if n.get("Relation Name")]
    assert "events_p_oct" not in scanned, (
        "NO PRUNING: the plan scans events_p_oct, but the query only wants "
        "November - partition pruning should have skipped October entirely.\n"
        "  Does your WHERE filter on the PARTITION KEY (ts) with plain "
        "comparisons the planner can prove?\n\nPlan:\n" + p.render()
    )
```

## The teaching point

Partitioning is infrastructure, not tuning: you adopt it for the
*operations* (retention by DROP, per-partition VACUUM and indexes,
parallel loads) and the pruning is the daily dividend. The mistakes
that hurt are architectural — partitioning by the wrong key (queries
that hit every partition are *slower* than one table), or too finely
(thousands of partitions strain planning). The interview-grade
summary: partition when a table's *maintenance* outgrows you, along
the axis your queries and your retention policy already agree on.

Next: **46_materialized_views** — precomputing the expensive answer.
