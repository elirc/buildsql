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

## Exercise 3 — reclaim and resample in one pass

Edit `ex3/solution.sql`. After the gate's mass `UPDATE`, `bloat_orders`
has ~100,000 dead tuples **and** statistics that describe the table as it
was before. Fix both with **one statement**.

`VACUUM` reclaims dead tuples. `ANALYZE` resamples statistics. `VACUUM
ANALYZE` does both in a single pass over the table, which is why it is the
standard thing to run after a bulk change — a mass update leaves you with
two problems, and running only the first one leaves the planner working
from a description of a table that no longer exists (lesson 36).

The gate checks that the dead tuples are gone *and* that fresh statistics
exist.

Run: `uv run dojo test 44_mvcc_vacuum_bloat ex3`

## Exercise 4 — indexes bloat too

Edit `ex4/solution.sql`. The mass `UPDATE` did not only bloat the table.
Every update wrote a new row version, and every new row version needed new
entries in every index — so `bloat_orders`'s indexes have roughly doubled
too, and a plain `VACUUM` does not compact them.

Write the **one statement** that rebuilds the table's indexes compactly.
The gate measures `pg_indexes_size('bloat_orders')` before and after and
requires a real shrink.

Two things worth knowing before you use it on something that matters. The
plain form takes an `ACCESS EXCLUSIVE` lock on the table for the whole
rebuild — an outage on a large index. `REINDEX ... CONCURRENTLY` (from
PostgreSQL 12) builds the replacement alongside the original and swaps it,
blocking almost nothing, at the cost of taking longer and being unable to
run inside a transaction block.

Run: `uv run dojo test 44_mvcc_vacuum_bloat ex4`

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


def _dead_tuples(dbname, wait_for_positive=True):
    # pg_stat views are snapshot-cached per transaction, so polling must
    # happen on an AUTOCOMMIT connection (each query = fresh snapshot).
    with db.connect(dbname, autocommit=True) as conn:
        n = 0
        for _ in range(40):
            n = conn.execute(
                "SELECT n_dead_tup FROM pg_stat_user_tables "
                "WHERE relname = 'bloat_orders'").fetchone()[0] or 0
            if not wait_for_positive or n > 0:
                return n
            time.sleep(0.25)
        return n


def test_ex1(lesson_db):
    L.apply_setup(lesson_db)
    live = lesson_db.execute("SELECT count(*) FROM bloat_orders").fetchone()[0]
    lesson_db.execute("UPDATE bloat_orders SET total = total + 1")
    lesson_db.commit()
    dead_before = _dead_tuples(lesson_db.info.dbname)
    assert dead_before >= live * 0.9, (
        "setup: the UPDATE should leave one dead tuple per row")

    ex = L.exercise("ex1")
    with db.connect(lesson_db.info.dbname, autocommit=True) as vconn:
        vconn.execute(ex.solution_sql)

    time.sleep(0.5)
    dead_after = _dead_tuples(lesson_db.info.dbname, wait_for_positive=False)
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


def test_ex3(lesson_db):
    L.apply_setup(lesson_db)
    live = lesson_db.execute("SELECT count(*) FROM bloat_orders").fetchone()[0]
    lesson_db.execute("UPDATE bloat_orders SET total = total + 1")
    lesson_db.commit()
    dead_before = _dead_tuples(lesson_db.info.dbname)
    assert dead_before >= live * 0.9, (
        "setup: the UPDATE should leave one dead tuple per row")

    ex = L.exercise("ex3")
    with db.connect(lesson_db.info.dbname, autocommit=True) as vconn:
        vconn.execute(ex.solution_sql)

    time.sleep(0.5)
    dead_after = _dead_tuples(lesson_db.info.dbname, wait_for_positive=False)
    assert dead_after <= dead_before * 0.1, (
        f"DEAD TUPLES REMAIN: {dead_before:,} before, {dead_after:,} after."
    )
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) > 0 FROM pg_stats WHERE tablename = 'bloat_orders'",
        True,
        "no fresh statistics: VACUUM alone reclaims space but tells the "
        "planner nothing. One statement does both.")


def test_ex4(lesson_db):
    L.apply_setup(lesson_db)
    lesson_db.execute("UPDATE bloat_orders SET total = total + 1")
    lesson_db.commit()
    size_before = lesson_db.execute(
        "SELECT pg_indexes_size('bloat_orders')").fetchone()[0]

    ex = L.exercise("ex4")
    with db.connect(lesson_db.info.dbname, autocommit=True) as rconn:
        rconn.execute(ex.solution_sql)

    size_after = lesson_db.execute(
        "SELECT pg_indexes_size('bloat_orders')").fetchone()[0]
    assert size_after < size_before * 0.8, (
        f"INDEXES DID NOT SHRINK: {size_before:,} bytes before, "
        f"{size_after:,} after.\n"
        "  Every updated row needed new index entries; VACUUM marks the old "
        "ones reusable\n  but does not compact the index. The statement that "
        "rebuilds indexes from scratch is what this exercise wants."
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
