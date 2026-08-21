# Reading - 52_keyset_pagination

`OFFSET` describes a page by counting the rows in front of it. Keyset
pagination describes a page by naming the row it starts at. Everything else in
this lesson — the index, the row-value comparison, the tiebreak, the direction
flip — follows from that one change of definition.

## Notes

**The cost model.** `OFFSET m LIMIT n` costs O(m + n): the executor must
produce m rows in order before it can know which one is the (m+1)th, and then
it discards them. An index removes the sort but not the walk, so page 10,001
of a 20-row feed still reads 200,020 index entries. Nothing about a page's
own contents makes it expensive — its *position* does, which is why deep
pagination degrades smoothly and invisibly until someone scrolls far enough to
complain.

**`OFFSET` is also unstable.** Positions are recomputed per request, so a row
inserted above the boundary between page requests pushes everything down one
slot: the reader sees one row twice and, if a row is deleted instead, misses
one entirely. Keyset pagination is defined against values rather than
positions, so concurrent inserts and deletes elsewhere in the table cannot
shift the page you asked for. This is the argument that wins the design
review, more often than the speed one.

**A cursor is the sort key of the last row you showed.** Not an id, unless the
sort is by id: the cursor must contain every column of the `ORDER BY`, because
that is what determines a position in the sequence. In an HTTP API you
usually base64 a small JSON object of exactly those columns and call it
`next_cursor`; the encoding is cosmetic, the requirement that it match the
sort is not.

**Row-value comparison, and the mistake it prevents.**
`(a, b) > (x, y)` is defined lexicographically — `a > x`, or `a = x AND b > y`
— which is precisely the order `ORDER BY a, b` produces. PostgreSQL can turn
that single comparison into one index condition on a `(a, b)` B-tree. Two
common hand-written substitutes are worse: `a >= x AND b > y` is simply wrong
(it drops every row with a larger `a` but a smaller `b`), and the correct
expansion `a > x OR (a = x AND b > y)` is right but is usually evaluated as a
filter rather than a seek. Write the row comparison.

**The sort key must be unique, and the primary key is how you get there.** If
two rows share the cursor's key, `>` skips one of them forever and `>=`
repeats one, and no amount of retrying reveals which — the page is simply
wrong. Appending the primary key to the `ORDER BY` makes the ordering total
and the cursor unambiguous. It costs nothing when the leading column is
already unique, so it is worth doing unconditionally; timestamps that "cannot
collide" collide the first time a batch job inserts a thousand rows in the
same millisecond.

**Direction, and keeping it uniform.** A descending page continues *below* its
cursor, so every `>` becomes `<` and the `ORDER BY` gains `DESC` on every
column. Keep all of the sort columns pointing the same way: a row comparison
only expresses uniform direction, so `ORDER BY rating DESC, id ASC` cannot be
written as one `(rating, id) < (...)` and additionally needs an index declared
`(rating DESC, id ASC)` to avoid a sort. Uniform direction also means one
plain ascending index serves both feeds — B-trees are walked in either
direction, and the plan says `Index Scan Backward`.

**NULLs do not belong in a cursor.** A row comparison against a NULL yields
NULL, which is not true, so the page silently ends. If a sort column is
nullable, either exclude NULLs from the paged set or page over a coalesced
expression with an index to match — and remember `NULLS FIRST`/`NULLS LAST`
is part of the ordering the index has to satisfy (lesson 35).

**Filters come before the sort in the index.** A feed that is both filtered
and ordered — one customer, one tenant, one status — needs the equality
columns first and the sort columns after: `(customer_id, ts)`, not `(ts)` and
not `(ts, customer_id)`. This is lesson 32's left-prefix rule and lesson 35's
ordering rule meeting in the same index, and it is the single most valuable
composite shape in application databases.

**What you give up.** There is no "jump to page 400" and no honest total page
count, because both are questions about positions. You get next, previous
(same comparison flipped), and a stable stream. Infinite scroll, activity
feeds, export jobs and cursor-based APIs never wanted the page numbers; a
back-office table with a page picker sometimes genuinely does, and there
`OFFSET` over a bounded, filtered result set is a defensible choice.

**Reading the plan.** The tell is the row count on the scan node, not the node
type. `Limit` over an `Index Only Scan` reading 200,020 rows is the OFFSET
version; the same plan reading 20 rows is the keyset version. If a `Sort`
appears, the index does not match the `ORDER BY`; if a `Seq Scan` appears, it
does not match the `WHERE` either.

## ex1 — the cliff, measured

The interesting number is in the plan rather than the clock: 200,020 rows into
a `Limit` that emits 20. Notice also what happens to the query's original
window predicate — once the cursor is a timestamp later than the window's
start, `ts >= '2023-11-11 12:00:00+00'` cannot exclude anything and is dead
weight. That is a general property of keyset pages: the cursor subsumes every
bound on the same column that lies behind it.

## ex2 — fast and wrong

The failure mode this exercise builds is worth internalising because it does
not look like a bug from the inside: the query is fast, the page is full, the
rows are real, and 1,658 books never appear. Nothing errors, nothing is slow,
and the report that eventually arrives says "search results are missing
items". Pagination bugs are found by walking every page and comparing the
union against the unpaginated query — which is exactly what this lesson's
challenge does.

## ex3 — the same trick, backwards

Two things flip together and they must flip together: the comparison operator
and the `ORDER BY` direction. Flip only the operator and you get twenty rows
from the wrong end of the table; flip only the `ORDER BY` and you re-serve the
page the user just read. The index does not flip at all, which surprises
people — an ascending B-tree serves a descending scan at the same cost, and
`DESC` in an index declaration only earns its keep when sort columns disagree
with each other.

## ex4 — the index has two jobs

A keyset query is only constant-time per page if the index can seek to the
cursor *within the filtered set*. With `(ts, id)` the executor can honour the
order but must test `customer_id` on every row it walks, so the cost becomes
"however far apart this customer's events are" — for one customer in 50,000,
that is the whole table. `(customer_id, ts)` pins the customer with the
leading equality and leaves that customer's rows already in `ts` order behind
it, which is the shape the query was asking for all along.

## challenge — proving a walk is lossless

Chaining pages is the real thing: an export job or a sync loop runs this
until a page comes back short. The detail people get wrong on the first
attempt is extracting the cursor from a descending page — the row you stopped
at is the page's *minimum* key, not its maximum. And `UNION ALL` is the honest
combinator here: `UNION` would silently deduplicate rows that appeared on two
pages, hiding precisely the defect the exercise exists to detect.

## Further reading

- [Paging Through Results](https://use-the-index-luke.com/sql/partial-results/fetch-next-page) — Markus Winand's canonical treatment of offset versus seek, with the correctness argument and the row-value syntax.
- [`LIMIT` and `OFFSET`](https://www.postgresql.org/docs/16/queries-limit.html) — the cost note and the documentation's own warning about paging without a deterministic `ORDER BY`.
- [Row Constructor Comparison](https://www.postgresql.org/docs/16/functions-comparisons.html) — the formal semantics of `(a, b) > (x, y)`, including how NULL operands behave.
- [Indexes and `ORDER BY`](https://www.postgresql.org/docs/16/indexes-ordering.html) — when an index can supply order directly, backward scans, and what `DESC`/`NULLS FIRST` in a declaration buy you.
- [Multicolumn Indexes](https://www.postgresql.org/docs/16/indexes-multicolumn.html) — why the filtered feed in ex4 wants its equality column first.
