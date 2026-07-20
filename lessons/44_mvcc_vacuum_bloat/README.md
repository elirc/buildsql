# 44 — MVCC, VACUUM, and bloat

Here is the secret that explains half of PostgreSQL's personality:
**UPDATE doesn't update and DELETE doesn't delete.** Under MVCC
(multi-version concurrency control), an UPDATE writes a *new* row
version and leaves the old one in place, invisible to new
transactions but still physically there — because a concurrent
transaction that started earlier may still need to see it. Readers
never block writers this way. The price: **dead tuples** — expired
versions nobody can see — accumulate until `VACUUM` reclaims them.
Unreclaimed, they are **bloat**: tables and indexes physically larger
than their live data, scans touching pages full of ghosts.

`setup.sql` gives you `bloat_orders` (100,000 rows, autovacuum off so
the janitor won't preempt your homework). The gate then UPDATEs every
row — instantly creating 100,000 dead tuples — and hands the mess to
your solution.

## Concept

```sql
SELECT n_live_tup, n_dead_tup, last_vacuum, last_autovacuum
FROM pg_stat_user_tables WHERE relname = 'bloat_orders';

VACUUM bloat_orders;        -- reclaim dead tuples for reuse
VACUUM FULL bloat_orders;   -- rewrite the table compactly (EXCLUSIVE LOCK!)
```

- Plain `VACUUM`: marks dead space reusable, updates the visibility
  map (lesson 34's dependency!), never blocks reads/writes — but
  mostly does **not** shrink the file; space is recycled internally.
- `VACUUM FULL`: rewrites the whole table into a new compact file.
  Takes an ACCESS EXCLUSIVE lock for the duration — on a big
  production table that's an outage. It's the fire extinguisher, not
  the sprinkler system.
- **Autovacuum** is the sprinkler system: it watches dead-tuple
  counters and vacuums (and re-ANALYZEs — lesson 36's other shoe)
  automatically. Real tuning means making autovacuum keep *up* (more
  workers, lower thresholds on hot tables), not vacuuming by hand.
- Two prose-only pressure-relief valves worth knowing: **HOT updates**
  (an update that changes no indexed column can reuse space on the
  same page cheaply) and **fillfactor** (leave headroom per page so
  HOT has room to work). File under "why update-heavy tables get
  fillfactor 80".

## Exercise 1 — reclaim

Edit `ex1/solution.sql`: after the gate's mass UPDATE, make ≥90% of
the dead tuples go away. (One statement. Not the FULL one — no lock
justification here.)

Run: `uv run dojo test 44_mvcc_vacuum_bloat ex1`

## Exercise 2 — shrink

Edit `ex2/solution.sql`: this gate measures the table's **file size**
before and after your solution and requires a real shrink. Plain
VACUUM won't move that number — see the concept section for what will,
and note the lock you'd be paying in production.

Run: `uv run dojo test 44_mvcc_vacuum_bloat ex2`

## The gate

```python
"""Gates for 44_mvcc_vacuum_bloat. Quoted verbatim in README.md.

VACUUM cannot run inside a transaction, so your solution runs on a
separate autocommit connection. Dead-tuple stats flow through the
cumulative stats system with a tiny lag; the gate polls briefly.
"""
import time

from dojo import db, grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def _dead_tuples(conn):
    for _ in range(20):
        n = conn.execute(
            "SELECT n_dead_tup FROM pg_stat_user_tables "
            "WHERE relname = 'bloat_orders'").fetchone()[0]
        if n is not None and n > 0:
            return n
        time.sleep(0.25)
    return 0


def test_ex1(lesson_db):
    L.apply_setup(lesson_db)
    lesson_db.execute("UPDATE bloat_orders SET total = total + 1")
    lesson_db.commit()
    dead_before = _dead_tuples(lesson_db)
    assert dead_before >= 90000, "setup: the UPDATE should leave ~100k dead tuples"

    ex = L.exercise("ex1")
    with db.connect(lesson_db.info.dbname, autocommit=True) as vconn:
        vconn.execute(ex.solution_sql)

    time.sleep(0.5)
    dead_after = lesson_db.execute(
        "SELECT n_dead_tup FROM pg_stat_user_tables "
        "WHERE relname = 'bloat_orders'").fetchone()[0]
    assert dead_after <= dead_before * 0.1, (
        f"DEAD TUPLES REMAIN: {dead_before:,} before your solution, "
        f"{dead_after:,} after - expected a >=90% drop.\n"
        "  The one-word statement that reclaims dead tuples is the lesson."
    )


def test_ex2(lesson_db):
    L.apply_setup(lesson_db)
    lesson_db.execute("UPDATE bloat_orders SET total = total + 1")
    lesson_db.commit()
    size_before = lesson_db.execute(
        "SELECT pg_relation_size('bloat_orders')").fetchone()[0]

    ex = L.exercise("ex2")
    with db.connect(lesson_db.info.dbname, autocommit=True) as vconn:
        vconn.execute(ex.solution_sql)

    size_after = lesson_db.execute(
        "SELECT pg_relation_size('bloat_orders')").fetchone()[0]
    assert size_after < size_before * 0.7, (
        f"FILE DID NOT SHRINK: {size_before:,} bytes before, {size_after:,} after.\n"
        "  Plain VACUUM reclaims space for REUSE but rarely returns it to the OS.\n"
        "  The variant that rewrites the table compactly is what this exercise wants\n"
        "  - and note what it costs: an exclusive lock for the whole rewrite."
    )
```

## The teaching point

The production symptoms of losing the vacuum race: a table whose
queries slow down while row count stays flat (bloat), index-only scans
degrading to heap fetches (stale visibility map — lesson 34's promise
kept), and in the worst case transaction-ID wraparound warnings in the
logs (VACUUM's other, existential job: freezing old tuples). The
monitoring queries you used today — `n_dead_tup`, `last_autovacuum` —
are exactly what you'd put on a dashboard. Autovacuum falling behind
is a pageable event; now you know what page it's from.

Next: **45_partitioning** — splitting a table along its time axis.
