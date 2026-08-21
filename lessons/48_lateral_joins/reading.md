# Reading - 48_lateral_joins

`LATERAL` means one thing: *this `FROM` item may reference the items to its
left*. Every use of it — top-N per group, per-row computation, unpivoting,
calling a set-returning function with a row's value — is that one rule
applied.

## Notes

**Why the restriction exists at all.** Items in a `FROM` clause are
conceptually evaluated independently and then joined, so a plain subquery in
`FROM` cannot see the other tables' columns. That is what makes join
reordering legal. `LATERAL` opts one item out of that rule: it is evaluated
once per row of what precedes it, like a correlated subquery that can return
many rows and many columns.

**`CROSS JOIN LATERAL` versus `LEFT JOIN LATERAL`.** With `CROSS JOIN
LATERAL`, an outer row whose subquery returns nothing **disappears** — it is
an inner join. `LEFT JOIN LATERAL (...) ON true` keeps it, NULL-extended.
For "top N per group", the difference is whether groups with no rows appear
at all, and it is lesson 09's mistake wearing a new costume.

**Top-N per group: three tools, and they are not interchangeable.**

- `row_number()` in a CTE (lesson 15): numbers *every* row, then discards.
  One pass, no index required, cost proportional to the whole table.
- `DISTINCT ON` (lesson 49): the N = 1 case, in three lines. Requires a sort
  by the partition key.
- `LATERAL`: runs a small query per group and stops at N. With a matching
  index, cost is proportional to *groups × N* rather than to the table.

For 6 categories × 5 rows, `LATERAL` reads 30 index entries where the window
version reads 10,000 rows. For a query that needs a rank *value* anyway, or
where there is no index to exploit, the window function wins. Knowing which
situation you are in is the point.

**Aggregates per row.** `LEFT JOIN LATERAL (SELECT count(*), sum(total)
FROM orders o WHERE o.customer_id = c.id) AS s ON true` computes several
aggregates for each customer in one subquery — where three scalar subqueries
in the SELECT list (lesson 13) would run three separate correlated queries.
Same answer, one traversal.

**Set-returning functions.** `FROM t, unnest(t.arr)` and
`FROM t, jsonb_array_elements(t.doc)` are implicitly lateral — PostgreSQL
allows the reference without the keyword when the item is a function call.
Writing `CROSS JOIN LATERAL` explicitly is clearer about what is happening.

**Reading a lateral plan.** It appears as a `Nested Loop` with the lateral
subquery on the inner side and `loops=` equal to the outer row count. That
is the cost model in one number, and it is also the warning: `LATERAL` over
a million outer rows with an unindexed inner query is a million small
queries.

## ex1 — top three products per category

Six outer rows, three inner rows each. The plan's `loops=6` is the whole
story — this is a correlated subquery that is allowed to return a table.

## ex2 — each department's two top earners

The same shape on a different pair of columns, which is the point of a rep.
Notice that the query reads almost exactly like the English sentence that
describes it: for each department, the two highest-paid people.

## ex3 — each customer's two most recent orders

Twenty groups, two rows each, and the version of this query that scales:
with an index on `(customer_id, created_at DESC)` the inner query is an
index scan that stops after two entries. Compare the plan against the
`row_number()` version from lesson 15 — same rows, very different work.

## ex4 — LATERAL as an unpivot

The lesson-17 idiom, and the clearest demonstration of the underlying rule:
the `VALUES` list references `p.attributes`, which is only legal because of
`LATERAL`. Once `LATERAL` reads as "may see the row to its left", this stops
looking like a trick.

## challenge — average price of each category's five priciest

An aggregate over a lateral subquery: the inner query produces five rows per
category, the outer one averages them. This is the composition that makes
`LATERAL` genuinely more expressive than `DISTINCT ON` — you can do
arbitrary work with the per-group rows, not just pick one.

## Further reading

- [`LATERAL` Subqueries](https://www.postgresql.org/docs/16/queries-table-expressions.html) — the "Table Expressions" chapter's `LATERAL` section, including the implicit-lateral rule for function calls.
- [`SELECT` — `FROM` clause](https://www.postgresql.org/docs/16/sql-select.html) — where `LATERAL` may appear and how it interacts with join types.
- [Window Functions](https://www.postgresql.org/docs/16/functions-window.html) — the other top-N-per-group tool, for the comparison in the notes.
- [Set Returning Functions](https://www.postgresql.org/docs/16/functions-srf.html) — `unnest`, `generate_series`, `jsonb_array_elements`: the functions most often used laterally.
