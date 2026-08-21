# Reading - 44_mvcc_vacuum_bloat

PostgreSQL never overwrites a row. An `UPDATE` writes a new version and
marks the old one dead; a `DELETE` only marks. Everything in this lesson —
bloat, vacuum, long-transaction pathologies, wraparound — follows from that
one implementation choice, and so does the reason readers never block
writers.

## Notes

**MVCC in one paragraph.** Every row version carries the transaction ids
that created and deleted it. Every transaction takes a *snapshot* and sees
only the versions visible to it. So a reader never waits for a writer and a
writer never waits for a reader — the great practical virtue of the design —
and in exchange the table accumulates versions nobody can see any more.

**Dead tuples are the cost.** Update every row of a 100,000-row table and
you now have 200,000 row versions, half of them dead. The table has doubled
on disk, sequential scans read twice as much, and the cache holds half as
much useful data.

**`VACUUM` marks space reusable; it does not give it back.** Plain `VACUUM`
scans for dead tuples and records their space as free *within* the table, so
future inserts reuse it. The file on disk stays the same size. That is
normally exactly right: the table has reached its working size and shrinking
it would just mean growing it again.

**`VACUUM FULL` rewrites the table compactly and returns the space** — under
an `ACCESS EXCLUSIVE` lock for the entire rewrite, and needing enough free
disk for a second copy. It is an outage on a large table. `pg_repack` does
the same job online and is what production systems use.

**Autovacuum is doing this already,** triggered when dead tuples exceed a
fraction of the table (`autovacuum_vacuum_scale_factor`, 20% by default).
Because it is proportional, a very large table can accumulate an enormous
absolute number of dead rows before autovacuum bothers — which is why big
tables often get per-table settings.

**`VACUUM` does three other jobs.** It updates the **visibility map**, which
is what makes index-only scans possible (lesson 34). It updates the **free
space map**. And it freezes old transaction ids to prevent **wraparound** —
a genuine emergency in which PostgreSQL will refuse writes to protect data.
An unvacuumable table is a countdown.

**The long-transaction pathology.** `VACUUM` may only remove versions no
running transaction could still need. One transaction left open for hours
pins the horizon and prevents cleanup *across the entire database*, including
tables it never touched. "Open a transaction, then wait on an HTTP call" is
the classic cause. `SELECT max(now() - xact_start) FROM pg_stat_activity
WHERE state <> 'idle'` is the query that finds it.

**Indexes bloat too, and differently.** Every new row version needs new
index entries. `VACUUM` marks index entries reusable but does not compact
the B-tree, so index bloat outlives table bloat. `REINDEX` rebuilds
compactly; `REINDEX CONCURRENTLY` does it without the outage.

**Where to look.** `pg_stat_user_tables` gives `n_dead_tup`, `last_vacuum`
and `last_autovacuum`. `pg_relation_size` and `pg_indexes_size` give the
sizes. Together they answer "is this table bloated, and is anything
cleaning it up?" — the two questions behind most mysterious slowdowns on
otherwise healthy systems.

## ex1 — reclaim

One word. Watch `n_dead_tup` fall to zero while `pg_relation_size` does not
move — that gap between "reclaimed" and "returned" is the whole distinction
between `VACUUM` and `VACUUM FULL`.

## ex2 — shrink

The file really shrinks, and the cost is the lock. Notice that the gate
could not have been written any other way: nothing except a full rewrite
moves that number, which is exactly why the operation needs scheduling
rather than improvising.

## ex3 — reclaim and resample in one pass

After a mass update you have two problems, and running only the first leaves
the planner reasoning about a table that no longer exists. `VACUUM ANALYZE`
is the habit to build for the end of any bulk load or migration.

## ex4 — indexes bloat too

The part people forget. Table bloat is visible in `pg_relation_size` and
gets fixed by autovacuum's ordinary work; index bloat is visible only in
`pg_indexes_size` and does not. On a table with a high update rate, a
periodic `REINDEX CONCURRENTLY` is routine maintenance, not an emergency
measure.

## Further reading

- [Routine Vacuuming](https://www.postgresql.org/docs/16/routine-vacuuming.html) — dead tuples, the visibility map, freezing, and transaction-id wraparound. The most operationally important chapter in the manual.
- [Concurrency Control (MVCC)](https://www.postgresql.org/docs/16/mvcc.html) — why readers never block writers, and what a snapshot is.
- [`VACUUM`](https://www.postgresql.org/docs/16/sql-vacuum.html) and [`REINDEX`](https://www.postgresql.org/docs/16/sql-reindex.html) — the options, including `CONCURRENTLY` and what it does not lock.
- [Monitoring Statistics](https://www.postgresql.org/docs/16/monitoring-stats.html) — `pg_stat_user_tables`, for `n_dead_tup` and the last-vacuum timestamps.
