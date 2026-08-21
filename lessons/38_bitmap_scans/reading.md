# Reading - 38_bitmap_scans

Between "look up three rows" and "read the whole table" there is a large
middle band, and PostgreSQL has a dedicated gear for it. Recognising a
bitmap scan in a plan tells you where your query sits on that spectrum.

## Notes

**What a bitmap scan actually does.** A `Bitmap Index Scan` walks the index
and records the *locations* of matching rows in a bitmap rather than
fetching them. The `Bitmap Heap Scan` above it then visits the heap in
**physical page order**, reading each page at most once. Compare that with a
plain `Index Scan`, which fetches rows one at a time in *index* order,
jumping around the table and possibly reading the same page repeatedly.

**Why it wins in the middle.** At three matching rows, random fetches are
trivially cheap and the plain index scan wins. At half the table, reading
everything sequentially wins. In between — very roughly 1% to 10% of a table
— sorting the fetches into physical order converts random I/O into something
close to sequential, and that is worth more than the cost of building the
bitmap.

**`BitmapAnd` and `BitmapOr`.** Bitmaps compose. Two separate single-column
indexes can be scanned independently and their bitmaps intersected
(`BitmapAnd`) or unioned (`BitmapOr`). This is how PostgreSQL serves `a = 1
AND b = 2` with two indexes, and how it serves `a = 1 OR b = 2` at all — a
composite index cannot help an `OR` across different columns. It is the
single strongest argument for keeping a few single-column indexes around
when your query mix is unpredictable.

**But a composite still beats it.** `BitmapAnd` reads *both* indexes in
full before intersecting; a composite index descends once to exactly the
right entries. If you know the combination is hot, build the composite. The
bitmap combination is a hedge, not a target.

**Lossy bitmaps.** When the bitmap grows past `work_mem`, PostgreSQL degrades
it to page granularity — remembering "this page has matches" rather than
which rows. The heap scan then rechecks every row on those pages, which
`EXPLAIN ANALYZE` reports as `Rows Removed by Index Recheck`. Seeing that
line means the bitmap went lossy and `work_mem` was the limit.

**Correlation changes the arithmetic.** If the indexed column happens to be
correlated with physical order, a plain index scan is already nearly
sequential and the planner will prefer it well past the usual threshold.
`events.ts` is the extreme case — and BRIN (lesson 43) exists precisely to
exploit it.

**You cannot request a bitmap scan, and should not want to.** It is the
planner's response to an estimated row count. When it appears where you
expected an index scan, the interesting question is "how many rows does it
think match?" — which is lesson 36 again.

## ex1 — OR across two columns

The case a composite index simply cannot serve. Two indexes, two bitmaps,
one union. Worth remembering when someone proposes replacing "all those
single-column indexes" with one composite.

## ex2 — medium selectivity

The middle gear in its natural habitat. Compare `EXPLAIN (ANALYZE, BUFFERS)`
for this query against the same query with a much narrower range: the narrow
one gets a plain `Index Scan`, and the switch happens without you asking.

## ex3 — two indexes, combined

The exercise is the plan you did *not* get. Two indexed columns in an `AND`
does not imply `BitmapAnd`: PostgreSQL costed the second index scan, decided
`product_id` alone had already narrowed things enough, and re-checked
`quantity = 5` as a filter instead.

That is worth taking seriously, because it means `BitmapAnd` occupies a
narrower band than the feature list suggests — it needs *both* predicates to
be individually unselective and their intersection to be small. Two
moderately selective columns, and the planner will take the better index and
filter. One very selective column, and it does the same. `BitmapOr` (ex1) is
the common case, because an `OR` genuinely cannot be answered from one index.

Build the composite `(product_id, quantity)` from lesson 32 in the lab and
compare buffer counts against this plan. The composite descends once; this
scans an index and then re-checks every row it found. Both beat a sequential
scan, and they are not equal — which is the argument for knowing your query
mix before choosing between one composite and several single-column indexes.

## ex4 — the middle gear

Two thousand rows out of a million. The plan sorts those row locations into
physical order before touching the heap, which is the entire trick.
`Heap Blocks: exact=...` in the plan output tells you how many pages it
actually read — compare that against the rows returned and the saving is
visible as a number.

Widen the range in the lab and watch the plan walk the spectrum: a handful
of products gives a plain `Index Scan`, a few hundred gives this bitmap
scan, and most of the catalogue gives a `Seq Scan`. Same index, same query
shape, three different plans — and the planner is right every time. That
spectrum, not the bitmap node itself, is the thing to remember.

## Further reading

- [Combining Multiple Indexes](https://www.postgresql.org/docs/16/indexes-bitmap-scans.html) — `BitmapAnd`/`BitmapOr` and the manual's advice on single-column versus composite.
- [Using `EXPLAIN`](https://www.postgresql.org/docs/16/using-explain.html) — the bitmap-scan example, including `Heap Blocks` and the recheck line.
- [Resource Consumption — `work_mem`](https://www.postgresql.org/docs/16/runtime-config-resource.html) — the setting that decides when a bitmap goes lossy.
- [Use The Index, Luke — Clustering Data](https://use-the-index-luke.com/sql/clustering) — why physical order matters so much to the cost of fetching rows.
