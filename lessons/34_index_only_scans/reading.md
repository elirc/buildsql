# Reading - 34_index_only_scans

An ordinary index scan is two steps: find the entries, then fetch each row
from the table. An index-only scan skips the second step entirely, because
everything the query asked for is already in the index. It is the single
biggest win available on a read-heavy workload, and it depends on a detail
of PostgreSQL's storage that surprises people.

## Notes

**Covering means the index contains every column the query touches** — in
the `SELECT` list, the `WHERE`, the `ORDER BY`, everywhere. One extra column
in the select list and the plan drops back to a plain `Index Scan` with a
heap visit per row. This is the strongest practical argument against
`SELECT *` that exists.

**Two ways to cover.** Widen the key — `(a, b)` — or use `INCLUDE` —
`(a) INCLUDE (b)`. `INCLUDE` columns live only in the leaf pages: they are
not part of the sort order, they do not appear in internal nodes (so the
tree stays shallow), and they may be types with no B-tree ordering at all.
The cost is that you cannot search or sort by them, and a unique index's
uniqueness applies only to the key columns — which is exactly the point when
you want `UNIQUE (email) INCLUDE (name)`.

**The visibility-map catch.** PostgreSQL's index entries do not record
whether a row version is visible to your transaction; only the heap does. So
an index-only scan still has to check visibility — unless the page is marked
*all-visible* in the table's **visibility map**, which `VACUUM` maintains.
Consequences that bite in production:

- A table that has just been heavily updated has few all-visible pages, so
  "index-only" scans do most of their heap fetches anyway.
- `EXPLAIN (ANALYZE)` reports `Heap Fetches: n` under the node. `n` near
  zero means it really is index-only; a large `n` means you have the plan
  but not the benefit.
- The fix is usually to vacuum more aggressively on that table
  (`autovacuum_vacuum_scale_factor`), not to change the index.

This course's template is vacuumed at seed time, so the visibility map is
warm and index-only scans behave.

**When covering is worth it.** Precisely when an ordinary index scan would
lose to a sequential scan: medium-selectivity queries where the heap visits
dominate. 20,000 random heap fetches cost more than reading the table
sequentially — remove them and the index wins again. Covering an index turns
a "too many rows for an index" query back into an index query.

**The cost.** A wider index is a bigger index: fewer entries per page, more
pages to read, more disk, and a larger write penalty on every update.
Covering four columns "just in case" is how an index becomes a second copy
of the table. Cover the query you actually run.

**A hint about ordering.** Index-only scans compose with lesson 35: an index
that covers *and* provides the `ORDER BY` order gives you a plan with no
heap visit and no sort node, which is about as good as PostgreSQL gets.

## ex1 — cover by widening the key

Search column first, output column second. Check `Heap Fetches:` in the
plan — it should be 0 or close to it, and that number is the difference
between an index-only scan that works and one that only looks like it does.

## ex2 — cover with INCLUDE

Same result, cheaper structure. The internal nodes of this index hold only
`customer_id`, so the tree is shallower than the ex1 version and the leaf
pages carry the payload. On a wide payload column the difference is
substantial.

## ex3 — cover a range of reviews

Twenty thousand matching rows — normally far past the point where an index
loses to a sequential scan. It wins here only because there are no heap
visits. That inversion is worth sitting with: covering does not make the
index faster, it removes the step that was making it slow.

## ex4 — payload with INCLUDE

The decision rule in one exercise: searched or sorted columns go in the key,
output-only columns go in `INCLUDE`. Try building it as `(order_id, price)`
instead and compare the index sizes with
`SELECT pg_size_pretty(pg_relation_size('...'))` — the difference is small
here and grows with the payload's width.

## Further reading

- [Index-Only Scans and Covering Indexes](https://www.postgresql.org/docs/16/indexes-index-only-scans.html) — the manual's own treatment, including the visibility-map explanation and `INCLUDE`.
- [Routine Vacuuming — the visibility map](https://www.postgresql.org/docs/16/routine-vacuuming.html) — why an under-vacuumed table cannot do index-only scans. Lesson 44.
- [`CREATE INDEX` — `INCLUDE`](https://www.postgresql.org/docs/16/sql-createindex.html) — the syntax and the restrictions on included columns.
- [Use The Index, Luke — Index-Only Scan](https://use-the-index-luke.com/sql/clustering/index-only-scan-covering-index) — the same idea from the "clustering data" angle, with the cost model spelled out.
