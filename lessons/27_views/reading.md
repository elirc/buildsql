# Reading - 27_views

A view gives a query a name. That sounds like a convenience and is actually
a governance tool: it moves a contested business definition out of thirty
dashboards and into one object that can be reviewed, changed and argued
with.

## Notes

**A view stores no data.** It is a saved query, expanded into whatever
references it at run time. `SELECT * FROM top_spenders WHERE country = 'US'`
does not filter a stored result; it re-runs the entire underlying
aggregation with an extra predicate, which PostgreSQL will usually push down
into the view's query. Materialized views (lesson 46) are the ones that
store results, and the difference between the two is the whole point of both
lessons.

**Views name cost, they never remove it.** A three-word `SELECT * FROM
customer_spend` can hide a 500,000-row aggregation. This is the single most
important practical caveat: a view makes an expensive query *look* cheap to
everyone who did not write it. In Part 5 you will `EXPLAIN` through a view
and watch it unfold into the query underneath.

**Views stack, and the stack is real.** A view over a view over a view is
legal and each layer re-expands. One or two levels is clarifying; five is
archaeology, and the plan is the union of everything below. When a view
stack gets deep, the fix is usually a materialized view at the bottom, not
more views.

**Encoding a definition means encoding its edge cases.** The `LEFT JOIN`
plus `coalesce(..., 0)` in `customer_spend` is deliberate: customers who
never ordered must appear with zero, not vanish. A view that quietly drops
a population is worse than a query that does, because more people trust it
and fewer people read it. Give your view's NULL handling the same scrutiny
you would give a report.

**Views and permissions.** A view runs with the privileges of its *owner*
by default, so you can grant access to a view over a table the caller cannot
read — which is how row-level and column-level access is often built. (Row
Level Security is the modern, more rigorous alternative.) `SECURITY
INVOKER` views, available from PostgreSQL 15, flip that back.

**Updatable views.** A simple view — one table, no aggregates, no `DISTINCT`,
no set operations — is automatically updatable: you can `INSERT`/`UPDATE`/
`DELETE` through it. Add `WITH CHECK OPTION` and PostgreSQL refuses writes
that would produce rows the view cannot see. Anything more complex needs an
`INSTEAD OF` trigger. This is a niche but genuinely useful tool for
compatibility shims during a migration.

**`CREATE OR REPLACE VIEW` has one sharp edge.** You may add columns at the
end, but you may not remove, rename or retype existing ones — the view's
output shape is part of its contract with everything that depends on it. To
change the shape you must `DROP` and recreate, which fails if other views
depend on it (`CASCADE` drops them too, which is rarely what you want at
3 p.m. on a Friday).

**When a view is the wrong answer.** When the thing you want to share is a
*parameterised* query — "revenue for this customer" — a view cannot take an
argument. That is a set-returning function, or a view plus a `WHERE` clause
that the planner can push down. When the query is slow and the data is stale-
tolerant, it is a materialized view.

## ex1 — encode the revenue definition

The `LEFT JOIN` and the `coalesce` are the whole exercise; the aggregation is
lesson 07. Fifty thousand rows out, including the 5,003 with zero — which is
the population every "average spend" calculation needs and most of them
quietly omit.

## ex2 — a view over the view

Notice what you did not repeat: the status list, the join, the coalesce.
That is the value proposition in one line. Notice also what you *cannot*
see from `top_spenders`: that a simple-looking filter re-runs a
half-million-row aggregation underneath.

There is a second, subtler win. If the revenue definition changes — refunds
count negative, say — you edit `customer_spend` and `top_spenders` is
correct immediately, because it never knew the definition in the first
place. A view stack is only as good as the layering: each level should add
exactly one idea that the level below does not know about.

## ex3 — a definition worth sharing

The revenue definition, finally written down once. Worth being explicit
about the three decisions baked into it — which statuses count, line items
rather than order totals, and the line's historical price — because all
three are invisible to somebody who only ever queries the view. Views make
definitions shareable; comments and column names make them *legible*.

## ex4 — a view that names a population

Measures get argued about; populations get argued about more, and usually
later, when two reports disagree and it turns out one of them counted
cancelled orders. `EXISTS` is the right tool for exactly the reason lesson
13 gave: it cannot fan out, so no customer appears twice and no `DISTINCT`
is needed to paper over one.

## Further reading

- [`CREATE VIEW`](https://www.postgresql.org/docs/16/sql-createview.html) — including updatable views, `WITH CHECK OPTION`, and `SECURITY INVOKER`.
- [The Rule System — views](https://www.postgresql.org/docs/16/rules-views.html) — how PostgreSQL actually implements views by query rewriting. Explains why a view costs what its query costs.
- [`CREATE MATERIALIZED VIEW`](https://www.postgresql.org/docs/16/sql-creatematerializedview.html) — the version that stores results, with `REFRESH ... CONCURRENTLY`. Lesson 46.
- [Row Security Policies](https://www.postgresql.org/docs/16/ddl-rowsecurity.html) — the modern alternative to permission-shaped views.
