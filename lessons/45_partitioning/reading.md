# Reading - 45_partitioning

Partitioning splits one logical table into many physical ones. It buys two
things that matter at scale — the planner can skip whole partitions, and
whole partitions can be added or removed as catalog operations — and it is
frequently applied to tables that need neither.

## Notes

**Declarative partitioning.** `CREATE TABLE events_p (...) PARTITION BY
RANGE (ts)` creates a parent that holds no data. Each partition is a real
table with a bound. Inserts route automatically. Queries against the parent
see all partitions as one table. `RANGE`, `LIST` and `HASH` are the three
strategies; time-series data is nearly always `RANGE` on a timestamp.

**Partition pruning is the query win.** If the planner can *prove* from the
`WHERE` clause that a partition cannot contain matching rows, it never opens
it. `WHERE ts >= '2023-11-01' AND ts < '2023-11-08'` skips October
entirely. The proof requirement is the catch: the filter must be on the
**partition key**, using operators the planner can reason about. A filter on
`customer_id`, or `WHERE date_trunc('day', ts) = ...`, prunes nothing and
scans every partition. Execution-time pruning (PostgreSQL 11+) handles
parameters whose values are only known at run time; you will see `never
executed` on the pruned branches in `EXPLAIN ANALYZE`.

**Cheap data lifecycle is the real win.** `DROP`/`DETACH PARTITION` removes
a month in milliseconds as a catalog change; the equivalent `DELETE` rewrites
hundreds of millions of rows, generates WAL proportional to the data, bloats
the table and then needs vacuuming. For any table with a retention policy,
this alone justifies partitioning.

**Maintenance is smaller, too.** Vacuum, analyse, index rebuild and backup
all operate per partition, so the unit of work is bounded by the partition
size rather than by the table size — which is what keeps a
hundred-billion-row table administrable at all.

**The costs are real.** Planning time grows with the partition count
(hundreds are fine; tens of thousands are not). Indexes are per partition,
so a global uniqueness constraint is only possible if the partition key is
part of the key. Cross-partition queries need to touch every partition.
Foreign keys *referencing* a partitioned table were not supported until
PostgreSQL 12.

**You must create partitions before the data arrives.** A range-partitioned
table with no partition covering tomorrow rejects tomorrow's inserts. Real
deployments create them ahead on a schedule (`pg_partman`, or a cron job) or
keep a `DEFAULT` partition as a safety net — noting that a `DEFAULT`
partition makes attaching new partitions expensive, because PostgreSQL must
scan it to prove no misplaced rows exist.

**When not to partition.** A table of ten million rows with no retention
policy and no partition-key filters gains nothing and pays planning
overhead. Partitioning is not a performance tool for tables that are merely
large; it is a manageability tool for tables that are large *and* have a
natural time or tenant axis. "Would `DROP PARTITION` replace a painful
`DELETE`?" is the honest test.

## ex1 — build it

Four statements: the parent, two partitions, and the data. Note that the
parent holds nothing itself — `pg_class.relkind = 'p'` marks it as a
partitioned table rather than an ordinary one.

## ex2 — see the pruning

The gate inspects which relations the plan actually scans, and October must
not be among them. Try `WHERE date_trunc('month', ts) = '2023-11-01'` in the
lab: the same rows, no pruning, every partition scanned. The filter must be
on the partition key in a form the planner can prove.

## ex3 — next month, before it arrives

Instant, and the operational point is the one to remember: a missing
partition is not a slow insert, it is a *failed* insert. Every partitioned
table in production needs something that creates partitions ahead of time,
and that something is part of the design, not an afterthought.

## ex4 — dropping a month in milliseconds

The strongest argument for partitioning, demonstrated. No rows rewritten, no
WAL, no vacuum, no bloat — and the detached table is still there if you want
to archive it first. Compare that against what the equivalent `DELETE` would
have cost in lesson 44's terms.

## Further reading

- [Table Partitioning](https://www.postgresql.org/docs/16/ddl-partitioning.html) — declarative partitioning, pruning, and the "Best Practices" section at the end. Read that section twice.
- [`ALTER TABLE ... ATTACH/DETACH PARTITION`](https://www.postgresql.org/docs/16/sql-altertable.html) — including `CONCURRENTLY` and the locking each form takes.
- [`CREATE TABLE ... PARTITION BY`](https://www.postgresql.org/docs/16/sql-createtable.html) — `RANGE`, `LIST` and `HASH`, and the rules for primary keys on partitioned tables.
- [pg_partman](https://github.com/pgpartman/pg_partman) — the extension most production systems use to create and retire partitions on a schedule.
