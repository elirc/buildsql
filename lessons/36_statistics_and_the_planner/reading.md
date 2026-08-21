# Reading - 36_statistics_and_the_planner

The planner does not know your data. It knows a statistical summary of it,
collected by `ANALYZE`, and every plan it produces is the cheapest route
*given what it believes*. Most bad plans are not bad decisions; they are
good decisions made on bad information.

## Notes

**What `ANALYZE` collects.** A random sample of rows per table, from which
PostgreSQL derives, per column: the fraction of NULLs, the number of
distinct values, a list of most-common values with their frequencies, a
histogram of the rest, and the physical/logical correlation. All of it lands
in `pg_statistic`, readable through the `pg_stats` view — go and look at it
for `orders.status`, because seeing the actual numbers demystifies the whole
subject.

**Selectivity drives everything.** From those summaries the planner
estimates how many rows each predicate will keep. That estimate decides
index versus sequential scan, which join algorithm to use, whether to hash
or sort, and how much memory to request. An estimate that is wrong by 1000×
does not produce a slightly worse plan; it produces a plan built for a
different query.

**Read the estimate/actual ratio first.** In `EXPLAIN ANALYZE`, find the
lowest node where `rows=` and `actual rows=` diverge badly. Everything above
it is a consequence. That single habit resolves most "why is this slow"
questions faster than any amount of index guessing.

**Autovacuum runs `ANALYZE` for you — eventually.** The trigger is
proportional to table size, so a big table can absorb a large absolute
number of changes before it resamples. After a bulk load, a migration, or a
mass `UPDATE`, run `ANALYZE` yourself. It is cheap, it is safe, and a
freshly loaded table with no statistics is the most common cause of a
catastrophically bad plan in production.

**The per-column knob.** `ALTER TABLE t ALTER COLUMN c SET STATISTICS n`
raises the sample detail for one column (default 100, max 10,000); the
global default lives in `default_statistics_target`. Raise it on skewed
columns where the most-common-values list is truncating something the
planner needs to know about.

**Correlated columns are the estimator's blind spot.** PostgreSQL assumes
predicates are independent, so `WHERE city = 'Paris' AND country = 'FR'`
gets estimated as the product of two selectivities — wildly too low, since
the two are perfectly dependent. `CREATE STATISTICS ... (dependencies,
ndistinct, mcv) ON a, b FROM t` teaches it otherwise. This is the fix for a
whole family of mysterious under-estimates.

**Correlation and the cost of an index scan.** `pg_stats.correlation` says
how closely a column's order matches the rows' physical order on disk. High
correlation (like `events.ts`, which is strictly increasing) makes an index
scan nearly sequential and therefore cheap; low correlation makes it random
I/O. This one number is why the same index is worth building on one column
and not on another — and it is the entire basis of BRIN (lesson 43).

**When the estimate is right and the plan is still bad**, the cost
*constants* may not match your hardware — `random_page_cost` defaults to 4.0,
which is sensible for spinning disks and much too high for SSDs, where
1.1 is typical. That single setting changes how willing the planner is to
use any index at all.

## ex1 — heal the stats

A table with no statistics at all, and a rare value the planner cannot
imagine. Watch the estimate before and after: this is what every freshly
restored database looks like until somebody analyses it.

## ex2 — selectivity in action

The same index, two queries, two different decisions — and the planner is
right both times. Refusing an index when the predicate matches most of the
table is a feature, and arguing with it (via `enable_seqscan = off`) is
almost always a way to make things slower while feeling productive.

## ex3 — buy the planner a better sample

A targeted knob rather than a global one. Note that the `ALTER` alone does
nothing: the target describes how the *next* `ANALYZE` should sample, so the
two statements are a pair. Forgetting the second one is the classic
half-applied tuning change.

## ex4 — a good estimate earns an index

The dependency, seen from the other side: with fresh statistics the planner
uses your index; without them it might not. Index tuning and statistics
tuning are the same activity, and an index that "does not work" is quite
often an index the planner has no reason to believe in.

## Further reading

- [Statistics Used by the Planner](https://www.postgresql.org/docs/16/planner-stats.html) — what `pg_stats` holds, and how each column is used.
- [Extended Statistics](https://www.postgresql.org/docs/16/planner-stats.html) — `CREATE STATISTICS` for correlated columns; the fix for multiplied-together selectivities.
- [Planner Cost Constants](https://www.postgresql.org/docs/16/runtime-config-query.html) — `random_page_cost`, `seq_page_cost`, `effective_cache_size`. Read the `random_page_cost` note about SSDs.
- [`ANALYZE`](https://www.postgresql.org/docs/16/sql-analyze.html) — sampling behaviour and the per-column statistics target.
