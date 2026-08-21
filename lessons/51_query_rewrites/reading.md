# Reading - 51_query_rewrites

An index is a contract with a *query shape*, not with a table. Every rewrite in
this lesson leaves the answer alone and changes only the shape — which is
exactly why they are safe to apply, and why the planner's behaviour flips so
completely when you do.

## Notes

**Sargable means "the index can seek on it".** SARG is short for *search
argument*: a predicate the access method can turn into a range of a B-tree.
`col = x`, `col > x`, `col BETWEEN x AND y` qualify. `f(col) = x` does not,
because the tree is sorted by `col`, not by `f(col)`. The fix is mechanical:
move the computation to the other side of the comparison until the column
stands alone. `date_trunc('day', created_at) = d` becomes
`created_at >= d AND created_at < d + interval '1 day'`; `upper(email) = 'X'`
becomes a case-insensitive comparison the index can serve, or an expression
index (lesson 40) if the shape is unavoidable.

**Half-open ranges are the idiom to memorise.** `>= start AND < next_start`
tiles a timeline with no gaps and no overlaps, works identically for dates,
timestamps and timestamptz, and sidesteps `BETWEEN`'s inclusive upper bound —
the reason `BETWEEN '2023-06-15' AND '2023-06-16'` quietly swallows midnight
of the 16th. It also survives a column type change from `date` to
`timestamptz`, which `BETWEEN` does not.

**`NOT IN (subquery)` is the one shape PostgreSQL refuses to optimise.**
`IN (subquery)` is turned into a semi-join; `EXISTS` into a semi-join;
`NOT EXISTS` into an anti-join. `NOT IN` is left as a `SubPlan`, because SQL
says a single NULL in the subquery makes the whole predicate UNKNOWN for every
non-matching row — so the transformation is not valid in general, and the
planner does not attempt it even when the column is `NOT NULL`. While the
collected ids fit in `work_mem` you get a hashed subplan and tolerable times;
when they stop fitting, the plan degrades to re-scanning the materialised list
once per outer row and the same query is suddenly thousands of times slower.
Nothing changed but the row count.

**That rewrite is not always semantics-preserving.** `NOT IN` and `NOT EXISTS`
agree only when the subquery's column has no NULLs. If it does, `NOT IN`
returns *nothing at all* (lesson 05) while `NOT EXISTS` returns the rows you
meant. In practice you almost always wanted `NOT EXISTS` — but check the
column's nullability before you claim the rewrite changed only the speed.

**An `OR` across two tables blocks every index.** Within one table, `WHERE a =
1 OR b = 2` becomes a `BitmapOr` of two index scans (lesson 38). Across a join
there is no such node: a bitmap addresses one relation's heap, so the executor
must form the whole join and filter afterwards. `UNION` of the two arms gives
each arm its own index-friendly plan. Use `UNION`, not `UNION ALL`, unless you
have proved the arms are disjoint — a row matching both arms was emitted once
by the original.

**`DISTINCT` over a join is usually a semi-join in disguise.** Joining to
`order_items` to ask "did this product ever sell?" multiplies each product by
its line-item count and then pays a `HashAggregate` to collapse the copies
back down. `EXISTS` asks the question directly: PostgreSQL probes the index and
stops at the first match, so duplicates are never produced and there is nothing
to deduplicate. The tell in a plan is a `HashAggregate` or `Unique` sitting on
top of a join that fans out — dedup nodes that exist only to undo work.

**Reading the plan for these four.** Non-sargable predicate: `Seq Scan` with
the function call in `Filter`. `NOT IN`: `SubPlan` and a `Materialize` under a
`Seq Scan`, no join node at all. Cross-table `OR`: a `Hash Join` whose output
row count is the whole table with `Join Filter` doing the work. Redundant
`DISTINCT`: `HashAggregate` above a join whose actual rows greatly exceed its
output. `dojo plan 51_query_rewrites <ex>` prints all of this.

## ex1 — the column under a function

The index on `orders (created_at)` is perfect and unusable at the same time,
which is the whole point: nothing about the DDL is wrong. Compare this with
lesson 40, where the same mismatch was fixed from the other end by building an
index on the expression. Rewriting the query is the better default — it ships
as a deploy rather than an index build, and one index on the bare column serves
every range, not just whole days.

## ex2 — the anti-join that never happens

Notice what the gate checks and what it does not: it asserts a real join node,
and it deliberately skips the clock. Timing this baseline at 500,000 rows is
the one measurement in the course not worth waiting for, which is itself the
lesson — a shape whose cost falls off a cliff as data grows is a bug you ship
long before you notice it. `LEFT JOIN ... WHERE right.id IS NULL` and
`NOT EXISTS` both plan as anti-joins; pick whichever reads better to you.

## ex3 — the OR that straddles the join

The interesting part of the rewrite is the first arm: once you stop needing the
customer's email, the join to `customers` adds nothing, because every order has
exactly one customer and the foreign key guarantees it. Dropping a join that
cannot change the row set is the same reasoning PostgreSQL applies in its own
join-removal optimisation — it just cannot apply it here, because as written
the join is load-bearing for the second arm.

## ex4 — DISTINCT as a symptom

Read `DISTINCT` in a code review as a question rather than a construct: *what
produced the duplicates?* If the answer is "the join did", the query is asking
an existence question with a multiplication tool. If the answer is "the data
has them", the `DISTINCT` is doing real work and belongs. The gate forbids
`HashAggregate` and `Unique` precisely because the honest rewrite makes those
nodes unnecessary rather than merely cheaper.

## challenge — three sins in one query

The wrinkle is worth the difficulty note: `JOIN orders` makes the VIP visible
only because they have at least one order, so an arm that selects the customer
by email alone quietly changes the answer for a customer who never ordered.
Rewrites are safe *because* they preserve rows, so a rewrite that changes them
under some data is not a rewrite — it is a bug you have not met yet. Adding
`EXISTS` to the second arm costs one index probe and keeps the equivalence
exact.

## Further reading

- [Subquery Expressions](https://www.postgresql.org/docs/16/functions-subquery.html) — the formal semantics of `EXISTS`, `IN` and `NOT IN`, including the NULL rule that stops the anti-join transformation.
- [Obfuscated Conditions](https://use-the-index-luke.com/sql/where-clause/obfuscation) — Markus Winand's catalogue of predicates that hide the column from the index, and the rewrite for each.
- [Using EXPLAIN](https://www.postgresql.org/docs/16/using-explain.html) — how to read `SubPlan`, `Join Filter` and `HashAggregate`, the three tells this lesson trains you to spot.
- [Combining Queries](https://www.postgresql.org/docs/16/queries-union.html) — `UNION` versus `UNION ALL`, and why the dedup matters when you split an `OR`.
- [Indexes on Expressions](https://www.postgresql.org/docs/16/indexes-expressional.html) — the other fix for a non-sargable predicate, when the query genuinely cannot be rewritten.
