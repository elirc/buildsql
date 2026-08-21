# Reading - 37_join_algorithms

PostgreSQL has exactly three ways to join two row sets. Knowing what each
one costs — and therefore which row counts make each one right — turns join
plans from mysterious into predictable.

## Notes

**Nested Loop.** For each row of the outer input, find the matching rows of
the inner input. Cost is roughly `outer_rows × inner_lookup_cost`. With an
index on the inner side, each lookup is a few page reads, so this is
unbeatable when the outer side is small. Without one, the inner side is
re-scanned per outer row and the cost is quadratic. It is the only algorithm
that can return the first row immediately, which makes it the natural
partner of `LIMIT`.

**Hash Join.** Build a hash table from the smaller input, then stream the
larger one past it, probing. Cost is roughly `rows_left + rows_right`, with
no index required — and it only works for **equality** conditions. This is
the right answer when both sides are large and you need most of both. If the
hash table does not fit in `work_mem`, PostgreSQL partitions it and spills
to disk in "batches"; a plan showing many batches is telling you `work_mem`
is too small for this query.

**Merge Join.** Sort both inputs by the join key, then walk them together
like a zip. Cost is dominated by the sorts — unless both sides are *already*
sorted, which is exactly what an index scan provides, at which point it is
extremely cheap and streams rows without materialising anything. It also
handles inequality join conditions, which a hash join cannot.

**You do not choose the algorithm; you choose the row counts.** This is the
most useful sentence in the lesson. The planner picks by estimated cost, so
the lever is the estimate — an index that shrinks the driving side, better
statistics (lesson 36), a rewritten predicate. `enable_hashjoin = off` and
friends exist for *diagnosis*, to see what the planner's second choice would
have been. Shipping them is how you get a query that is fast today and
pathological after the data grows.

**Join order matters as much as join algorithm.** For n tables there are
factorially many orders, and PostgreSQL searches them exhaustively up to
`join_collapse_limit` (default 8) and switches to a genetic algorithm beyond
that. A twelve-table report can therefore get a *randomly* different plan
between runs — worth knowing before you spend an afternoon on it.

**Outer joins constrain the search.** `A LEFT JOIN B` cannot always be
reordered the way an inner join can, which is why replacing an unnecessary
`LEFT JOIN` with an `INNER JOIN` sometimes produces a dramatic speedup: it
gives the planner permission it did not previously have.

**Reading a join node.** Look for the `Hash` node under a `Hash Join` — the
input it chose to build from should be the smaller one, and when it is not,
the estimate is wrong. For a `Nested Loop`, check `loops=` on the inner
node: `actual time` there is per loop, and multiplying it out is often the
moment the real cost becomes visible.

## ex1 — earn a Nested Loop

A small driving side plus an indexed inner side. Note the plan's `loops=`
value on the inner node — that is the outer row count, and the whole cost
model in one number.

## ex2 — respect the Hash Join

Both sides large, no index needed, and the planner is right. Hash joins have
a bad reputation among people who learned on smaller systems; for
full-table analytical joins they are exactly correct.

## ex3 — a nested loop worth having

The index shrinks the driving side from a million rows to about a hundred,
and the primary-key index on `products` does the rest. Two indexes, neither
of them "for the join" in any obvious sense, and the join algorithm changes.

## ex4 — change the row count, change the algorithm

The same query planned two ways, before and after your index — hash join to
nested loop, without a character of SQL changing. Keep this one in mind the
next time somebody proposes a query rewrite to "force a better join": the
row counts are the thing to change.

## Further reading

- [Planner Method Configuration](https://www.postgresql.org/docs/16/runtime-config-query.html) — the `enable_*` flags, and the manual's warning about using them in production.
- [Use The Index, Luke — Joins](https://use-the-index-luke.com/sql/join) — nested loops, hash joins and sort-merge joins, each explained from the index outward.
- [Controlling the Planner with Explicit `JOIN` Clauses](https://www.postgresql.org/docs/16/explicit-joins.html) — `join_collapse_limit`, `from_collapse_limit`, and how to pin a join order when you truly must.
- [Using `EXPLAIN`](https://www.postgresql.org/docs/16/using-explain.html) — re-read the join examples now that the three algorithms have names.
