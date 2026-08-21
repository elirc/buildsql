# Reading - 03_order_limit

Sorting is the first operation in this course with a *cost model* worth
carrying in your head, and pagination is the first place where a query that
is correct on page one becomes a production incident on page one thousand.

## Notes

**There is no default order, and there never was.** A table is a set of
rows; the order you see without `ORDER BY` is an artefact of how PostgreSQL
happened to read them — insertion order in a fresh table, something else
after an `UPDATE` moves a row, something else again when the planner uses an
index or splits the scan across parallel workers. The failure mode is
cruel: it looks stable for months and then changes when the data grows past
a threshold. If an order is visible to a human, it belongs in the SQL.

**Ties must be broken explicitly.** `ORDER BY price DESC` over 10,000
products with duplicate prices leaves the tied rows in an arbitrary
sequence, and "arbitrary" is allowed to differ between two runs of the same
query. Every ordered exercise in this course names a tie-breaker — usually
`id`, because it is unique — and that habit is what makes an ordering
*total* rather than merely *partial*. It is also what makes pagination
coherent: without a total order, "the next ten rows" is not a well-defined
concept.

**`ORDER BY ... LIMIT n` is not a sort followed by a truncation.**
PostgreSQL recognises the combination and switches to a *top-N heapsort*,
keeping only the best n rows it has seen in memory rather than sorting the
whole input. You can see it in `EXPLAIN` as `Sort Method: top-N heapsort`.
It is a large constant-factor win — but it is still O(rows), because every
row must be looked at to know it is not in the top fifteen. The only way to
avoid touching every row is an index whose order already matches your
`ORDER BY`, which is lesson 35.

**`OFFSET` does not skip work, it discards it.** `OFFSET 500 LIMIT 10`
produces 510 rows internally and throws 500 away. The cost grows linearly
with the page number, so deep pagination gets slower the further a user
scrolls, and — worse — it is *incorrect* under concurrent writes: if a row
is inserted before page 2 is requested, one row shifts across the boundary
and the user sees a duplicate or misses an item entirely. The professional
alternative is **keyset pagination** (also called seek, or cursor
pagination): remember the sort key of the last row you showed and ask for
`WHERE (price, id) > (last_price, last_id) ORDER BY price, id LIMIT 10`.
It is constant-time per page, it is stable under concurrent inserts, and
with the right index it is one of the fastest things a database can do.
Markus Winand's page on this is in the links below and is worth reading
twice.

**`NULLS FIRST` / `NULLS LAST` is a real decision.** PostgreSQL's default is
NULLs last when ascending, first when descending — consistent with treating
NULL as larger than everything. Other engines differ. Writing it explicitly
costs two words and removes a portability question and a code-review
question at once.

## ex1 — top N

10,000 rows sorted to produce 10. Look at the plan: `Limit` above `Sort`
above `Seq Scan`, and the sort reporting `top-N heapsort`. That shape — the
whole table read, most of it discarded — is the baseline that Part 5 exists
to improve on.

## ex2 — multi-key sort

Three sort keys, each breaking ties in the one before. This is also the
first exercise where the *order* of the keys is the whole answer: sorting by
salary then department produces a completely different report from
department then salary. When a stakeholder says "sorted by department and
salary", they have not told you which is primary, and asking is not pedantry.

## ex3 — pagination with OFFSET

Page 3 of a customer list, newest first. Note the descending tie-break on
`id`: with `created_at DESC` and two customers created in the same second,
`id DESC` keeps them in a stable, meaningful order. Choosing a tie-breaker
that *agrees* with the primary key's direction is a small thing that makes
paginated output feel coherent to a user.

## ex4 — where do NULLs sort?

One NULL in five hundred rows, and it changes the first line of the report.
The deeper point: NULL is not "smaller" or "larger" than a number — SQL has
to be *told* where to put it, because the question is not answerable by
comparison. That is the same fact that makes `NULL = NULL` unknown, and
lesson 05 is entirely about it.

## ex5 — top N over half a million rows

Same query shape as ex1, fifty times the data. The plan is identical; only
the row counts change. Keep the timing in mind — in lesson 35 you will add
one index and watch the `Sort` node disappear from this plan, because a
B-tree is already sorted and PostgreSQL can simply read the first fifteen
entries in order.

## ex6 — a deep page

The point of this exercise is that it is *identical* to ex3 apart from one
number, and yet a report that scrolls deep enough will eventually time out.
Try `OFFSET 9990 LIMIT 10` in the lab and watch the timing move. Then read
the keyset-pagination link below; the rewrite is not hard, and it is what
you should reach for whenever a page number can grow without bound.

## challenge — top 5 per category without window functions

Genuinely hard, and deliberately so. `LIMIT` applies to the whole result, so
"per group" needs something that evaluates *per row* — a correlated subquery
that asks, for each product, how many products in the same category are more
expensive. It is O(n²)-ish and it is what people wrote before 2003. In
lesson 15 you will replace the whole thing with `row_number() OVER
(PARTITION BY category ORDER BY price DESC)` and in lesson 48 with a
`LATERAL` join. Solving it the hard way first is what makes those two
lessons land.

## review1 — the five cheapest in a category

A filter, a sort, and a limit — the three clauses of this lesson and the
last, composed. Predict the tie-break behaviour before you run it.

Worth noticing when it returns: the five cheapest products in a category is
a *top-N within a group* question restricted to one group. Ask it for all
six categories at once and you have the challenge, which needs a correlated
subquery today and a window function in lesson 15. Recognising that two
questions are the same question with a different `WHERE` is most of what
makes SQL feel small rather than endless.

## Further reading

- [Sorting Rows](https://www.postgresql.org/docs/16/queries-order.html) — `ASC`/`DESC`, `NULLS FIRST`/`LAST`, and what `ORDER BY` can reference.
- [`LIMIT` and `OFFSET`](https://www.postgresql.org/docs/16/queries-limit.html) — including the docs' own warning about inconsistent results without `ORDER BY`.
- [Use The Index, Luke — Paging Through Results](https://use-the-index-luke.com/sql/partial-results/fetch-next-page) — the definitive explanation of why `OFFSET` is the wrong tool and what keyset pagination looks like.
- [Use The Index, Luke — Top-N Queries](https://use-the-index-luke.com/sql/partial-results/top-n-queries) — how an index turns `ORDER BY ... LIMIT` into a few page reads. Preview of lesson 35.
