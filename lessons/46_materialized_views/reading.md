# Reading - 46_materialized_views

A view names a query. A materialized view names a query **and stores its
result**. That single difference converts an expensive aggregation into a
table lookup, and hands you a new problem — staleness — that you now own.

## Notes

**What it is.** `CREATE MATERIALIZED VIEW m AS <query>` runs the query once
and stores the rows. Reads hit the stored rows; the underlying tables are
not touched. It is a real relation on disk: you can index it, `ANALYZE` it,
and query it exactly like a table.

**Index it.** This is the step people skip. A matview without indexes is a
heap, so `SELECT * FROM m WHERE k = ...` scans it. The whole point was to
make a query cheap; an index on the lookup column finishes the job. And a
**unique** index is required for `REFRESH ... CONCURRENTLY`, which makes it
an operational decision as much as a performance one.

**Refreshing.** `REFRESH MATERIALIZED VIEW m` re-runs the query and replaces
the contents, holding an `ACCESS EXCLUSIVE` lock throughout — readers are
blocked for the entire rebuild. `REFRESH ... CONCURRENTLY` computes the new
contents, diffs them against the old using the unique index, and applies
only the changes, so readers never block and never see a partial state. It
is slower in absolute terms and almost always the right choice for anything
a person is looking at. It also cannot run inside a transaction block, and
cannot be used on a matview that has never been populated (`WITH NO DATA`).

**Staleness is now your design problem.** PostgreSQL has no incremental
maintenance and no automatic refresh — no triggers, no scheduler, nothing.
You decide: a cron job, a `pg_cron` schedule, a refresh at the end of the
ETL that loaded the data, or a refresh triggered by a queue. And you decide
what "acceptably stale" means, which is a *product* question. A revenue
dashboard refreshed hourly is fine; an account balance is not.

**Show the staleness.** The cheapest way to keep a stale number honest is to
publish its age. Store a `refreshed_at` column, or expose the matview's
last refresh time next to the number. Users forgive an hour-old figure they
were told about, and never forgive one they discovered.

**The decision.** Reach for a matview when the query is expensive, the
result is small relative to the input, the data changes far less often than
it is read, and stale-by-minutes is acceptable. Reach for a plain view
(lesson 27) when the query is cheap or freshness is non-negotiable. Reach
for a summary table maintained by triggers when you need both freshness and
speed and are willing to pay for the complexity.

**Where it sits among the alternatives.** An index makes an existing query
faster without changing what it returns. A matview changes *when* the work
happens — moving it off the read path and onto a schedule. Denormalisation
and rollup tables do the same thing with more control and more code. They
are points on one spectrum: how far ahead of the question do you compute the
answer?

## ex1 — materialize the leaderboard

The gate compares the matview against the live aggregation and then requires
the query to be fast. Note that both properties matter: a matview that is
fast and wrong is worse than the slow query it replaced.

## ex2 — pay the freshness bill

Rows change behind the view's back and it keeps reporting yesterday. That is
not a bug, it is the contract. Every materialized view is a promise to
refresh it, and the promise lives outside the database.

## ex3 — a matview you can refresh online

Two statements, and the second is the one that determines how the first is
operated for the rest of its life. A unique index costs almost nothing and
buys you non-blocking refreshes; adding one later means an outage-shaped
migration on a view that is already in production.

## ex4 — refresh without the outage

The concurrent refresh, and the reason ex3 insisted on the unique index. Note
the detail the gate has to work around: `REFRESH ... CONCURRENTLY` cannot run
inside a transaction block. That is a real constraint on your scheduling
code, and it is the sort of thing that is much cheaper to learn here than in
a migration script at 3 a.m.

**Part 5 complete.** Next: the capstone.

## Further reading

- [Materialized Views](https://www.postgresql.org/docs/16/rules-materializedviews.html) — the concept chapter, with the staleness discussion.
- [`REFRESH MATERIALIZED VIEW`](https://www.postgresql.org/docs/16/sql-refreshmaterializedview.html) — `CONCURRENTLY`, its unique-index requirement, and `WITH NO DATA`.
- [`CREATE MATERIALIZED VIEW`](https://www.postgresql.org/docs/16/sql-creatematerializedview.html) — storage parameters and tablespaces.
- [pg_cron](https://github.com/citusdata/pg_cron) — the usual answer to "what refreshes it", running inside PostgreSQL itself.
