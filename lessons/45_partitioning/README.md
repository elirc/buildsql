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

## Exercise 3 — next month, before it arrives

Edit `ex3/solution.sql`. Your ex1 partitioned table is created first
automatically. December is coming: add a third partition,
**`events_p_dec`**, covering `'2023-12-01'` up to `'2024-01-01'`.

```sql
CREATE TABLE events_p_dec PARTITION OF events_p
  FOR VALUES FROM ('2023-12-01') TO ('2024-01-01');
```

One statement, instant, no data moved.

This is the operational half of partitioning and the half that gets
forgotten. A range-partitioned table with no partition for tomorrow's data
**rejects the insert** — there is nowhere to put it. Production systems
either create partitions ahead of time on a schedule (a cron job, or
`pg_partman`) or attach a `DEFAULT` partition as a safety net. Discovering
this at midnight on the first of the month is a rite of passage worth
skipping.

The gate checks that `events_p` now has at least three partitions attached
and that the new one is one of them.

Run: `uv run dojo test 45_partitioning ex3`

## Exercise 4 — dropping a month in milliseconds

Edit `ex4/solution.sql`. Retention policy: October's clickstream is out of
scope. Detach it.

```sql
ALTER TABLE events_p DETACH PARTITION events_p_oct;
```

Your ex1 table is created first automatically.

This is the reason time-series tables get partitioned, more than query
speed. `DELETE FROM events WHERE ts < '2023-11-01'` on a real event table
means rewriting hundreds of millions of rows, generating an enormous amount
of WAL, bloating the table, and then needing a `VACUUM` to reclaim any of
it. `DETACH PARTITION` is a **catalog update**: the table is no longer part
of the parent, and it takes about as long as this sentence.

After detaching you can archive it, `DROP` it, or leave it standing as an
ordinary table — the gate checks it still exists as a table and is no
longer a partition, and that `events_p` now holds only November.

(`DETACH PARTITION CONCURRENTLY` avoids taking a strong lock on the parent,
which is what you want on a live system.)

Run: `uv run dojo test 45_partitioning ex4`

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


def test_ex3(lesson_db):
    lesson_db.execute(L.exercise("ex1").solution_sql)
    lesson_db.commit()
    ex = L.exercise("ex3")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) >= 3 FROM pg_inherits i "
        "JOIN pg_class parent ON parent.oid = i.inhparent "
        "WHERE parent.relname = 'events_p'",
        True, "events_p has at least three partitions attached")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM pg_inherits i "
        "JOIN pg_class parent ON parent.oid = i.inhparent "
        "JOIN pg_class child ON child.oid = i.inhrelid "
        "WHERE parent.relname = 'events_p' AND child.relname = 'events_p_dec'",
        1, "events_p_dec is attached to events_p as a partition")
    lesson_db.execute("SAVEPOINT dec_probe")
    lesson_db.execute(
        "INSERT INTO events_p (id, customer_id, event_type, payload, ts) "
        "VALUES (99000001, 1, 'view', '{}'::jsonb, '2023-12-15 10:00+00')")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM events_p_dec WHERE id = 99000001",
        1, "a December row routes into the December partition automatically")
    lesson_db.execute("ROLLBACK TO SAVEPOINT dec_probe")


def test_ex4(lesson_db):
    lesson_db.execute(L.exercise("ex1").solution_sql)
    lesson_db.commit()
    november = lesson_db.execute(
        "SELECT count(*) FROM events WHERE ts >= '2023-11-01'").fetchone()[0]

    ex = L.exercise("ex4")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()

    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM pg_inherits i "
        "JOIN pg_class parent ON parent.oid = i.inhparent "
        "JOIN pg_class child ON child.oid = i.inhrelid "
        "WHERE parent.relname = 'events_p' AND child.relname = 'events_p_oct'",
        0, "events_p_oct is no longer attached to events_p")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM pg_class WHERE relname = 'events_p_oct'",
        1, "but the table itself still exists - DETACH is not DROP")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM events_p", november,
        "events_p now holds only the November rows, and not one row was "
        "rewritten to make that true")
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
