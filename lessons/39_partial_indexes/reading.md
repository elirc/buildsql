# Reading - 39_partial_indexes

A partial index indexes *some* of the rows. That is a small syntactic
addition and a large design idea: most tables have a hot minority and a cold
majority, and there is no reason to pay for indexing the majority.

## Notes

**The predicate decides membership, not filtering.** `CREATE INDEX ... ON
orders (total) WHERE status = 'cancelled'` builds a structure containing
only cancelled orders. Rows that do not match are absent — so they cost
nothing to store and, more importantly, nothing to maintain when they are
inserted or updated.

**The planner must prove implication.** Your query's `WHERE` has to logically
imply the index's predicate, and PostgreSQL's prover is deliberately simple.
`status = 'cancelled'` works. `status IN ('cancelled')` works. `status <>
'paid'` does not, even though a human can see it overlaps. Parameterised
queries are the common trap: `WHERE status = $1` cannot be proven to imply
`status = 'cancelled'`, because the value is unknown at planning time. If a
partial index is mysteriously unused, this is nearly always why.

**Three canonical uses.**

1. *A hot subset.* Queue tables are the classic: `WHERE processed = false`
   indexes the handful of pending rows and ignores the ten million done
   ones. The index stays small forever even as the table grows without
   bound.
2. *Excluding NULLs.* `WHERE col IS NOT NULL` on a mostly-NULL column shrinks
   the index to the rows that could ever match.
3. *Partial uniqueness.* `CREATE UNIQUE INDEX ... ON t (email) WHERE
   deleted_at IS NULL` enforces "unique among active rows" — a rule that a
   plain `UNIQUE` constraint cannot express, and one that soft-delete
   schemas need constantly.

**Partial versus composite.** A composite `(status, total)` index stores
every row and uses the low-cardinality column as the first tree level. A
partial index on `(total) WHERE status = 'cancelled'` stores a sixth of the
rows and spends its whole structure on the discriminating column. When one
value of the filter column is overwhelmingly the one you query, partial
wins on size, on write cost and on cache residency. When you query all the
values, the composite is the general answer.

**The write-cost argument is the underrated one.** Every index must be
updated on every insert and on every update of an indexed column. An index
covering 16% of the rows is skipped entirely for the other 84% of writes.
On write-heavy tables this often matters more than the read speedup.

**Watch the subset drift.** A partial index is a bet that the predicate stays
selective. `WHERE created_at > '2024-01-01'` looks great and slowly becomes
an index over the whole table. Predicates on *state* age well; predicates on
*time* do not.

## ex1 — the hot subset

The queue-table pattern, on order status. Compare
`pg_relation_size` of your partial index against a full index on the same
column — the ratio is roughly the selectivity of the predicate, and it is
the whole argument in one number.

## ex2 — partial + ordering

Partial and ordered at once: the predicate shrinks it, the sort order makes
`ORDER BY ... LIMIT` free. Composing lesson 35 with this one is how the
"latest N pending items" query — the heart of every job queue — becomes
constant-time.

## ex3 — index only the rare status

83,000 rows out of 500,000. Try changing the query's predicate to `status <>
'paid'` in the lab and watch the index go unused: the rows would qualify,
and the planner cannot prove it. That failure is worth seeing once.

## ex4 — the five-star index

The column assignment is the exercise: the discriminating column goes in the
index, the constant one goes in the predicate. Getting it backwards —
indexing `rating` with a predicate on `product_id` — produces an index that
is useless for every product but one.

## Further reading

- [Partial Indexes](https://www.postgresql.org/docs/16/indexes-partial.html) — the manual's chapter, including the partial-uniqueness example and the note on predicate proving.
- [`CREATE INDEX`](https://www.postgresql.org/docs/16/sql-createindex.html) — where the `WHERE` clause goes and what expressions it may contain.
- [Use The Index, Luke — Partial Indexes](https://use-the-index-luke.com/sql/where-clause/null/partial-index) — the NULL-excluding case, explained well.
- [Monitoring index usage](https://www.postgresql.org/docs/16/monitoring-stats.html) — `pg_stat_user_indexes.idx_scan`, for confirming your partial index is actually being chosen.
