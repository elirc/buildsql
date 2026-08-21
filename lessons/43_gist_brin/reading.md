# Reading - 43_gist_brin

B-trees are not the only index type, and the two in this lesson exist for
cases a B-tree serves badly: data with a shape (GiST) and data with an
order it already has on disk (BRIN).

## Notes

**BRIN summarises block ranges.** For every group of pages — 128 by default
— it stores the minimum and maximum value found there. Nothing else. To
answer a range query it walks that tiny summary, discards every range whose
min/max cannot overlap, and scans only the surviving pages. The index for a
three-million-row table is measured in **kilobytes**, against hundreds of
megabytes for a B-tree on the same column.

**It only works on correlated data.** If the values in each block range are
tightly clustered, most ranges can be excluded. If they are scattered — like
`customer_id` in a clickstream — every range's min/max spans the whole value
space, nothing is excluded, and the index does nothing while still costing
you maintenance. `pg_stats.correlation` (close to 1 or -1) is the number to
check before building one, and it is the entire design decision.

**The archetype.** Append-only, time-ordered tables: logs, events, metrics,
audit trails. Rows arrive in timestamp order and are never moved, so
physical order and timestamp order agree permanently. `events.ts` in this
database is strictly increasing with `id`, which is why both columns are
BRIN-friendly.

**BRIN is lossy by design.** It never identifies rows, only candidate pages,
so every BRIN plan is a `Bitmap Heap Scan` that rechecks each row. That is
fine when the ranges exclude 99% of the table and useless when they exclude
nothing.

**Tuning.** `pages_per_range` trades index size against precision — smaller
ranges give finer exclusion at slightly more space. New data is not
summarised until `VACUUM` runs or you call `brin_summarize_new_values()`,
so a BRIN index on a freshly loaded table can appear not to work.
`autosummarize = on` handles this automatically.

**Where B-trees still win.** Point lookups. A BRIN cannot find one row; it
can only narrow to a few thousand pages. If you need `WHERE ts = x` to
return one row instantly, that is a B-tree.

**GiST is a different idea entirely.** Where a B-tree indexes a total order,
GiST is a framework for indexing things that have *shape* — geometric
objects, ranges, full-text vectors, `pg_trgm` similarity. Its operators are
overlap (`&&`), containment (`@>`), and distance (`<->`), not less-than. Two
consequences worth knowing even without a geometric column: `EXCLUDE USING
gist (room WITH =, daterange(...) WITH &&)` is how you enforce
non-overlapping bookings (lesson 25), and `ORDER BY point <-> :target LIMIT
10` is a k-nearest-neighbour search executed *as an index scan* rather than
as a sort.

**The general lesson.** An index is a data structure plus a set of operators
it can answer. B-tree: ordered values, equality and range. Hash: equality
only. GIN: contents of a composite value, containment and membership. GiST:
shape, overlap and distance. BRIN: physical clustering, ranges over huge
tables. Choosing an index type is choosing which of those matches your
query.

## ex1 — BRIN the clickstream

A kilobyte-scale index over three million rows, answering a half-day range.
Compare `pg_relation_size` of this index with a B-tree on the same column —
the ratio is usually four or five orders of magnitude, and that is what
makes BRIN viable on tables where a B-tree would be unaffordable.

## ex2 — weigh both trees

Both indexes on the same column, so you can see the trade directly: the
B-tree is faster and enormous, the BRIN is slower and free. On a
hundred-billion-row event table, "free" wins.

## ex3 — tune the block range

`pages_per_range = 32` gives four times the summary detail for a two-hour
query. On a wider query it would make no measurable difference — which is
the honest version of most tuning knobs: they matter at one end of the
workload and not the other.

## ex4 — the rows your BRIN cannot see

The operational half of BRIN, and the reason people report that it "doesn't
work" after a bulk load. Summarisation is deliberately lazy: covering a
range the instant a row lands in it would mean touching the index on every
insert, which is the cost BRIN exists to avoid. So new pages sit
unsummarised — invisible to range exclusion — until `VACUUM` reaches them or
you call `brin_summarize_new_values()` yourself.

Two habits follow. Summarise (or vacuum) after any bulk load into a
BRIN-indexed table. And prefer `WITH (autosummarize = on)` when the table
grows continuously, so autovacuum keeps up without anyone remembering to.

The exercise this replaced is still worth doing in the lab, and the reason
it was replaced is instructive. It asked for a BRIN on `events.id` to show
that BRIN cares about *physical correlation* rather than about time — which
is true, except that `events.id` is the primary key and already has a
B-tree, so the comparison was rigged from the start. Run it on
`events.customer_id` instead: check `pg_stats.correlation` for `ts`, `id`
and `customer_id`, and you will see the rule before you run a single query.

## Further reading

- [BRIN Indexes](https://www.postgresql.org/docs/16/brin.html) — how block-range summaries work, `pages_per_range`, `autosummarize`, and the operator classes.
- [GiST Indexes](https://www.postgresql.org/docs/16/gist.html) — the extensible framework, its operators, and the k-nearest-neighbour support.
- [Range Types](https://www.postgresql.org/docs/16/rangetypes.html) — the `EXCLUDE USING gist` non-overlap constraint, in full.
- [Index Types](https://www.postgresql.org/docs/16/indexes-types.html) — the one-page summary of B-tree, hash, GiST, SP-GiST, GIN and BRIN, and what each can answer.
