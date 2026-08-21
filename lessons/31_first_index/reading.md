# Reading - 31_first_index

An index is a sorted copy of some columns, plus a pointer back to each row.
That is the entire idea. Everything else in Part 5 is a consequence of it —
including every case where an index does not help.

## Notes

**Why sorted order is the whole trick.** Finding one value among 500,000
unsorted rows means looking at all of them. Finding it in a sorted structure
means a handful of comparisons: PostgreSQL's B-tree is a balanced tree with
a high branching factor, so even a million-row index is three or four levels
deep. Three page reads instead of a hundred thousand — that is where the
factor of a thousand comes from, and it is why the speedup grows with the
table rather than staying constant.

**An index scan is two steps.** Walk the tree to find matching entries, then
visit the heap to fetch each row (because the index holds only the indexed
columns and a pointer). The second step is random I/O, one page per matching
row, and it is why an index stops being worth it when the match is large:
reading 200,000 rows one random page at a time is *slower* than reading the
whole table sequentially. The planner knows this, which is why it sometimes
refuses to use an index you just built — and it is usually right. Lesson 38
covers the middle ground and lesson 34 covers avoiding the heap visit
entirely.

**PostgreSQL does not index foreign keys automatically.** Primary keys and
unique constraints get an index because they need one to enforce
uniqueness. Foreign-key *columns* get nothing. So `orders.customer_id`,
`order_items.order_id` and `reviews.product_id` — the three columns every
join in this course uses — are unindexed in the shipped schema, which is
both realistic and the reason lesson 33 has a war story. Two consequences:
joins scan, and deleting a parent row scans the child table looking for
references.

**Selectivity decides whether an index is worth building.** An index earns
its keep by *eliminating* rows. `total > 1999.90` matches a handful out of
500,000 — excellent. `status = 'paid'` matches half the table — the planner
will ignore the index and it is right to. The rule of thumb is that a plain
B-tree index stops paying somewhere around 5–10% selectivity, though the
real threshold depends on row width and physical clustering.

**Indexes are not free.** Each one is a separate structure that must be
updated on every `INSERT`, `UPDATE` (of an indexed column) and `DELETE`, it
consumes disk, and it competes for cache. A table with twelve indexes has
twelve write amplifications. The right number is "the ones your queries
actually use" — and `pg_stat_user_indexes.idx_scan` tells you which ones
those are, which is how you find the index somebody added in 2021 that has
never been read.

**Building an index locks writes** unless you use `CREATE INDEX
CONCURRENTLY` (lesson 28). On a live table, always concurrently.

## ex1 — index the lookup

One column, one index, and a speedup of two or three orders of magnitude.
Run `dojo plan 31_first_index ex1` before and after: the `Seq Scan` becomes
an `Index Scan`, and the estimated cost drops by roughly the same factor as
the measured time.

## ex2 — watch the index NOT help

The counter-example, and the reason the gate *requires* a `Seq Scan` here.
An index on `customer_id` cannot serve a filter on `total`; the index is
sorted by the wrong thing. Internalising "an index helps the column it is
on, and only that column" prevents most of the confusion in lessons 32
and 33.

## ex3 — one product's reviews

The single most common index in any real schema: a foreign-key column,
filtered by equality. Note that the *query* is unchanged from what you would
have written in Part 1; the index changes what the planner can do with it,
not what it means.

## ex4 — indexing a value, not a key

Selectivity in one exercise. `total > 1999.90` matches a handful; the index
is spectacular. Try `WHERE total > 100` in the lab with the same index and
watch the planner ignore it — matching 95% of the table means the index scan
would cost more than reading everything, and being *right* about that is one
of the planner's most useful behaviours.

## challenge — same move, bigger table

Three million rows, and the point is that the shape of the answer does not
change with the scale. The factor does: the bigger the haystack, the more an
index is worth, which is the opposite of most optimisations.

## Further reading

- [Indexes](https://www.postgresql.org/docs/16/indexes.html) — the whole chapter; start with "Introduction" and "Index Types".
- [`CREATE INDEX`](https://www.postgresql.org/docs/16/sql-createindex.html) — the syntax, including `CONCURRENTLY`, `INCLUDE`, and partial-index predicates.
- [Use The Index, Luke — Anatomy of an Index](https://use-the-index-luke.com/sql/anatomy) — the clearest explanation anywhere of what a B-tree is and why the leaf nodes are a doubly linked list.
- [Monitoring index usage](https://www.postgresql.org/docs/16/monitoring-stats.html) — `pg_stat_user_indexes`, for finding the indexes nobody has ever used.
