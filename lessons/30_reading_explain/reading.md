# Reading - 30_reading_explain

`EXPLAIN` is the only feedback loop in this course that tells you *why* a
query is slow rather than *that* it is. Everything in Part 5 is a
consequence of learning to read it.

## Notes

**`EXPLAIN` versus `EXPLAIN ANALYZE`.** Plain `EXPLAIN` shows the plan and
the planner's *estimates* without running anything. `EXPLAIN ANALYZE`
actually executes the query and adds measured row counts and timings. Use
ANALYZE by default — the gap between estimate and actual is the single most
diagnostic number in the output — but remember that it really runs the
query, so `EXPLAIN ANALYZE DELETE ...` deletes. Wrap those in a transaction
and roll back.

**Read a plan inside out and bottom up.** The tree is printed with the
final step at the top; execution flows from the leaves upward. Each node
consumes rows from its children and emits rows to its parent. The first
question to ask of any plan is "which leaf touches the most rows, and why
does it have to?".

**The numbers on a node line.** `cost=0.00..8543.00` is the planner's
arbitrary-unit estimate: startup cost before the first row, then total cost.
`rows=25000` is the estimated row count; `width=42` the estimated bytes per
row. With ANALYZE you also get `actual time=0.014..38.2 rows=24983 loops=1`.

**Estimate versus actual is the diagnosis.** When `rows=1` and `actual
rows=250000`, the planner chose its algorithm on a false premise and the
plan above that node is probably wrong too — that is lesson 36. Look for the
node where the ratio first explodes; everything above it is a consequence,
not a cause.

**`loops` matters more than it looks.** A node inside a nested loop runs
once per outer row, and `actual time` is reported **per loop**. A node
showing `actual time=0.05 rows=1 loops=250000` took twelve seconds, not
0.05 ms. Multiply before you conclude anything.

**Node types worth recognising immediately.**

- `Seq Scan` — read every row of the table. Correct for "most of the table",
  a red flag for "three rows".
- `Index Scan` — walk an index, then fetch each matching row from the heap.
- `Index Only Scan` — answer entirely from the index, no heap visit
  (lesson 34).
- `Bitmap Index Scan` + `Bitmap Heap Scan` — collect matching row locations,
  sort them, then read the heap in physical order. The planner's middle
  gear (lesson 38).
- `Nested Loop` / `Hash Join` / `Merge Join` — the three join algorithms
  (lesson 37).
- `Sort` — with `Sort Method: quicksort`, `top-N heapsort`, or `external
  merge Disk: ...`, the last of which means it spilled and `work_mem` is
  too small.
- `HashAggregate` / `GroupAggregate` — the two ways to group.

**`BUFFERS` is the underrated option.** `EXPLAIN (ANALYZE, BUFFERS)` reports
how many 8 KB pages each node read, and whether they came from PostgreSQL's
cache (`shared hit`) or from the operating system (`shared read`). Timings
vary with cache state and machine load; buffer counts are stable, which
makes them the better metric for comparing two plans. `EXPLAIN (ANALYZE,
BUFFERS, FORMAT JSON)` is what this course's own gates parse.

**A plan is a hypothesis about your data.** The planner does not know your
data; it knows a statistical summary of it (lesson 36). Every plan is the
cheapest route *given what it believes*, which is why the fix for a bad plan
is more often better statistics or a better index than a query rewrite.

## ex1 — name that node

A filter on an unindexed column has exactly one option: read everything. The
useful reflex to build is the reverse one — when you see `Seq Scan` on a
large table returning few rows, ask which index would have been used
instead, and why it does not exist.

## ex2 — read three facts from one plan

Estimated rows, actual rows, and total time. Those three numbers answer
"did the planner know what it was doing?" and "did it matter?" — which is
the whole of plan reading in two questions.

## ex3 — name the sort method

`top-N heapsort` is the planner recognising `ORDER BY ... LIMIT` and keeping
only ten rows in memory rather than sorting ten thousand. Note what it does
*not* save: every row is still read and compared. Removing the pass entirely
needs an index whose order already matches (lesson 35), and the difference
between "sorted cheaply" and "not sorted at all" is the difference between
40 ms and 0.1 ms.

## ex4 — name the join algorithm

`Hash Join` is the right choice here and the plan says so: no usable index
on `orders.customer_id`, and the query needs every row anyway. Watch what
the planner does with the same join once lesson 31 gives it an index and
lesson 37 changes the row counts — the SQL never changes, and the algorithm
does.

## Further reading

- [Using `EXPLAIN`](https://www.postgresql.org/docs/16/using-explain.html) — the canonical walkthrough, with worked examples of every node type above. Read it once properly; it is the best-written chapter in the manual.
- [`EXPLAIN`](https://www.postgresql.org/docs/16/sql-explain.html) — the options: `ANALYZE`, `BUFFERS`, `VERBOSE`, `SETTINGS`, `FORMAT JSON`.
- [explain.depesz.com](https://explain.depesz.com/) — paste a plan, get the per-node exclusive time and the estimate/actual ratios highlighted. The fastest way to find the guilty node in a large plan.
- [Use The Index, Luke — Anatomy of an Index](https://use-the-index-luke.com/sql/anatomy) — what a B-tree actually is, which makes every plan node in Part 5 easier to reason about.
