# Reading - 35_order_by_and_indexes

A B-tree is not just a lookup structure, it is a *sorted* one — and that
second property is worth as much as the first. An index whose order matches
your `ORDER BY` does not merely find rows faster; it removes the sort
entirely, which is what makes `LIMIT` cheap.

## Notes

**A sort is a barrier.** It must consume its whole input before it can emit
the first row, so `ORDER BY x LIMIT 10` over a sorted-by-something-else
input reads everything, sorts it (or top-N heapsorts it), and then discards
all but ten. An index in the right order lets the plan *pipeline*: read the
first ten entries, stop. That is the difference between O(rows) and
O(limit), and it grows without bound as the table grows.

**The index order must match the query order, including direction.** A
B-tree can be walked forwards or backwards, so a single-column `ORDER BY`
works with either declaration — you will see `Index Scan Backward` in the
plan. Direction only matters when sort keys disagree with each other:
`ORDER BY a ASC, b DESC` requires an index declared `(a ASC, b DESC)`,
because neither walk of a plain `(a, b)` index produces that sequence.

**`NULLS FIRST`/`LAST` is part of the order too.** The default for `ASC` is
`NULLS LAST`, and an index declared with the other convention will not
satisfy the query. When a `Sort` node refuses to disappear despite an index
that looks right, this is a common culprit.

**Equality columns first, then sort columns.** `WHERE customer_id = 7 ORDER
BY created_at DESC` wants `(customer_id, created_at)`: the equality pins a
region of the index, and inside that region the entries are already ordered.
This is the most valuable composite-index shape there is, because it serves
"one customer's most recent N" — the query behind almost every activity feed
and audit log ever built.

**A range column ruins the ordering for everything after it.** `WHERE
created_at > x ORDER BY total` cannot be served in order by
`(created_at, total)`: within the matched range, `total` is not sorted. You
get the range scan or the ordering, not both. This is the same rule as
lesson 32's, seen from the sort side, and it is why some queries genuinely
need a sort.

**Ordered index scans and `DISTINCT`/`GROUP BY`.** The same property lets
PostgreSQL replace a `HashAggregate` with a pipelined `GroupAggregate`, and
a `Unique` node over a sorted input is nearly free. An index built for an
`ORDER BY` often speeds up unrelated grouping queries for this reason.

**Keyset pagination is where this pays off most.** Lesson 03 argued that
`OFFSET 100000` is linear in the page number. With an index matching the
sort, `WHERE (created_at, id) < (:last_created, :last_id) ORDER BY
created_at DESC, id DESC LIMIT 10` is a single descent into the tree and ten
entries — constant time, on page one and page ten thousand alike. That
combination is the practical payoff of this lesson.

## ex1 — a customer's most recent orders

The activity-feed shape. Check the plan: `Limit` directly over `Index Scan`,
with no `Sort` in between. When somebody says "the feed got slow as we
grew", this is usually the missing index.

## ex2 — global top-N

No `WHERE`, so the index exists purely to provide order. Twenty rows read
out of half a million, and the cost does not change as the table grows —
which is the property that makes a leaderboard safe to ship.

## ex3 — one product's latest reviews

Equality plus sort, the composite shape from the notes. Try the index the
other way round — `(created_at, product_id)` — and watch the `Sort`
disappear but the scan become enormous: the ordering is right and the
filtering is not.

## ex4 — the newest reviews, globally

The simplest case, and the one that demonstrates direction-independence: the
index is declared ascending and the query wants descending, and the plan
says `Index Scan Backward` with no sort. Worth seeing once so that you do
not add `DESC` to every index out of superstition.

## Further reading

- [Indexes and `ORDER BY`](https://www.postgresql.org/docs/16/indexes-ordering.html) — direction, `NULLS FIRST`/`LAST`, and when an ordered scan beats a sort.
- [Use The Index, Luke — Indexing Order By](https://use-the-index-luke.com/sql/sorting-grouping/order-by) — including the pipelined-order-by argument that makes `LIMIT` cheap.
- [Use The Index, Luke — Paging Through Results](https://use-the-index-luke.com/sql/partial-results/fetch-next-page) — keyset pagination, now that you have the index that makes it work.
- [`CREATE INDEX`](https://www.postgresql.org/docs/16/sql-createindex.html) — the `ASC`/`DESC`/`NULLS` clauses on index columns.
