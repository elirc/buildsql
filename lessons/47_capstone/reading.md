# Reading - 47_capstone

The capstone is not a new topic. It is the moment the three questions of
this course — is it correct, does it hold together, what does it cost —
stop being separate lessons and become one job.

## Notes

**The diagnostic order.** Faced with a slow query: read the plan, find the
node with the largest `actual rows` or the worst estimate/actual ratio, and
ask what would let PostgreSQL skip that work. Only then reach for an index,
a rewrite, or a materialized view. Guessing at indexes without reading a
plan is how a schema accumulates twelve of them and gets slower.

**Not every index is worth building, and not every scan is a bug.** A
sequential scan of a table you need half of is the correct plan. An index
that the planner declines is often an index that should not exist — it costs
writes and disk and buys nothing. The skill is knowing which situation you
are in, and the plan tells you.

**Migrations on live tables have a shape.** Add nullable, backfill
set-based, constrain, then remove the old thing. Every step is instant or
concurrent; none of them holds a lock while scanning. Departing from that
shape is how a deploy becomes an outage, and the departure is usually
"it was only 10,000 rows" — which is true until the table is not 10,000
rows.

**Set-based, not row-based.** A backfill written as one `UPDATE` with an
expression beats a per-row loop or a correlated subquery by orders of
magnitude. This is the single most valuable instinct to bring from
application programming into SQL, and it applies to every part of this
course.

**The invariant is worth writing down.** Lesson 23's gate checked that the
account balances summed to 1000, not just that Alice had 650. Every
migration and every report has an equivalent: a number that must not change,
or a relationship that must hold. Assert it alongside the change; it catches
the bug you did not think of.

**What you now have.** A query language you can compose without looking
things up. A schema vocabulary — types, constraints, normalization, views —
for making illegal states unrepresentable. A mental model of MVCC,
statistics, and the six index types. And a debugging loop that starts with
evidence rather than intuition. That combination is what the rest of your
career in databases is built on.

## ex1 — make the dashboard fast

A landing-page chart, which means the latency budget is a human's patience.
Note the gate's `_no_seq_scan_on({"orders"})` rather than a blanket ban:
`customers` may be hash-joined however the planner likes. Plan assertions
should constrain what matters and leave the rest to the planner.

## ex2 — ship a schema change to a live table

The full lesson-28 discipline: nullable column, set-based backfill, `SET NOT
NULL`, `CHECK ... NOT VALID`, `VALIDATE`. The gate checks `convalidated`
because the half-finished version — constraint added, never validated — is
the one that ships.

## ex3 — diagnose from the plan

A plan handed to you cold, exactly as a colleague would paste it. The fat
node is the one to index; everything above it is a consequence. Being able
to point at the guilty node in ten seconds is the most portable skill in
Part 5.

## ex4 — the product page's review widget

One parent, most recent N children — the shape behind every activity feed,
comment thread and notification list ever built. The `Sort` node is the
enemy: it must consume everything before emitting anything, so it turns a
five-row query into a hundred-thousand-row one.

## ex5 — a second live migration, end to end

Four statements whose order is the exercise, plus a trap worth remembering:
adding the unique index before the backfill would *succeed*, because NULLs
are distinct from each other in a unique index. A migration that appears to
work is more dangerous than one that fails.

## ex6 — one more plan to read

The counter-lesson, and a good one to finish on. Half the table matches, so
no index can help, and the planner declining your index is it being right.
"Add an index" is not the answer to every slow query; sometimes the answer
is a partial index, a materialized view, or accepting that reading half a
table costs what it costs.

## Further reading

- [Performance Tips](https://www.postgresql.org/docs/16/performance-tips.html) — the manual's own summary chapter, worth reading now that every section of it means something to you.
- [Using `EXPLAIN`](https://www.postgresql.org/docs/16/using-explain.html) — one more pass; you will read it differently now than you did in lesson 30.
- [`ALTER TABLE` — Notes](https://www.postgresql.org/docs/16/sql-altertable.html) — the table of which forms rewrite and which do not. Bookmark it.
- [Use The Index, Luke](https://use-the-index-luke.com/) — the whole book, if you have not already. It is the best single text on the subject and it is free.
