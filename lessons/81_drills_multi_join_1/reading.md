# Reading - 81_drills_multi_join_1

Report SQL. The joins are easy; choosing the grain and pinning down each
measure's definition is the job.

## Notes

**Decide the grain before you type.** "One row per status", "one row per
month per category", "one row per country" - that sentence determines the
`GROUP BY` and everything else follows. Most report bugs are grain bugs:
the query groups at a finer level than the question, or aggregates across a
join that has already multiplied the rows.

**The join grain is usually the order line.** Once `order_items` is in the
`FROM`, one order with three lines is three rows. Sums over line columns are
correct at that grain; anything counting orders or customers must use
`count(DISTINCT ...)`, and anything summing an order-level column (like
`orders.total`) is now wrong by a factor of the line count.

**Every measure has a definition, and they rarely agree.** In one report,
revenue excludes cancelled orders, the order count includes them, and the
buyer count counts customers rather than orders. `FILTER (WHERE ...)` is what
lets differently-defined measures share one pass; without it people write
three subqueries and join them.

**You cannot nest aggregates, so two levels means two queries.** "Average
number of lines per order" is `avg` of a `count`, which Postgres rejects
outright. Collapse to one row per order in a subquery or CTE, then aggregate
those rows. The rejection is a feature - it forces you to say which grain the
average is over.

**A row-level percentage needs a number from outside the row.** Either an
uncorrelated scalar subquery that recomputes the total, or a window function
over the already-aggregated result. `sum(x) OVER ()` after a `GROUP BY` totals
the groups, which is exactly what a share-of-total column wants.

**Top-N-per-group is always two layers.** Aggregate to (group, candidate,
measure), then rank within the group and keep the winners. `max()` gives you
the number but not the row it came from, and joining back on the number
breaks on ties.

**Half-open date ranges, always.** `>= start AND < next_start`. `BETWEEN` on
a `timestamptz` includes both endpoints, so a midnight row lands in two
buckets - a bug that shows up as a total that is very slightly too big and
that nobody ever finds.

## ex1 - the smallest possible report

Two tables, one grouping column, two measures. `customers` contributes
nothing to the output; it is there so the country filter has something to
filter.

The classic mistake is `BETWEEN '2023-09-01' AND '2023-09-30'`, which drops
everything after midnight on the 30th - most of a day of orders. Half-open
ranges have no such edge case and never need you to know how long the month
was.

The model answer joins, filters, and groups by `o.status`; the reference is
the same query written from the other table, to make the point that join
order changes nothing.

## ex2 - aggregate, then rank, then cut

`LIMIT` applies to the grouped rows, so the query has to aggregate all of
October before it can know which ten products win. That is not a wasteful
plan, it is the only correct one.

The classic mistake is the missing tie-break. Several products in this window
sit on identical unit totals, and `ORDER BY units DESC` alone lets the
planner return them in any order - so the tenth row changes between runs and
the query is not reproducible. `ORDER BY units DESC, p.id` fixes it, and
naming the tie-break unprompted is a habit worth having.

The model answer groups the three-table join by product and limits. The
reference aggregates `order_items` down to one row per product first and
joins `products` afterwards, which is the cheaper shape when the product
table is wide.

## ex3 - grouping by a computed column

The month does not exist as a column; it is `date_trunc('month',
o.created_at)`, and grouping by an expression is exactly as legal as grouping
by a column.

The classic mistake is `GROUP BY month`, referring to the `SELECT` alias.
Postgres does allow that as an extension, but it does not allow it once the
alias collides with a real column name, and it is not portable - writing the
expression again, or using the output position `GROUP BY 1, 2`, always works.

The model answer groups by the two expressions and sorts by the same. Note
that `date_trunc` on a `timestamptz` returns a `timestamptz`, so the month
column is a timestamp at midnight, not a date - worth knowing before you
compare it to something.

## ex4 - three measures, three definitions

This is the exercise that teaches the habit. `buyers` counts customers,
`orders` counts orders including cancelled ones, `revenue` sums only the
non-cancelled ones. Three different scopes, one join, no `WHERE` on the
status.

The classic mistake is a `WHERE o.status <> 'cancelled'`, which fixes the
revenue and quietly corrupts the order count. The second is `count(c.id)` for
the buyers, which counts orders again because the join has already repeated
each customer once per order.

The model answer uses `count(DISTINCT o.customer_id)`, a plain `count(*)`,
and a `FILTER`ed `sum` with a `coalesce`. The reference writes the filtered
sum as a `CASE` inside the aggregate - the portable spelling, and the one to
recognise in older code.

## ex5 - two levels of aggregation

"Average lines per order" is an average of a count. `avg(count(*))` is a
syntax error, and the error is telling you that two different grains are
involved: one row per order for the count, one row per status for the
average.

The classic mistake is skipping the first level - grouping the joined rows by
status and dividing line count by order count by hand. That gives the same
number here, but it stops working the moment the outer aggregate is anything
other than a mean, and it hides the intermediate result that makes the query
readable.

The second mistake is an inner join to `order_items`. Around one order in
seven has no lines at all; dropping them raises both averages, because the
zeros that should pull the mean down are simply absent. The `coalesce` on the
units matters for the same reason - `avg` skips NULLs, so a NULL there would
silently reduce the denominator too.

## ex6 - a share of a total

Each row needs the grand total, which no single group can compute. Two
answers, both worth having: an uncorrelated scalar subquery that recomputes
the window's revenue once, or `sum(revenue) OVER ()` applied to the already
grouped rows.

The classic mistake in the general case is integer division - `100 * x / y`
where both are integers floors to a whole number. It does not bite here,
because `numeric * numeric` stays numeric, but the ordering of the operations
still does: divide first and you round a fraction below 1 to zero before the
multiplication can rescue it. Multiply, then divide, then round.

The model answer uses the scalar subquery; the reference uses the window
function over a subquery that has already grouped. The window version is the
one to prefer when the total is expensive, because it reuses the rows you
already have instead of rescanning.

## ex7 - the best one per group

Two layers. Layer one: revenue for every (country, category) pair. Layer two:
within each country, keep the row with the highest revenue.

The classic mistake is `max(revenue) GROUP BY country`, which gives the
winning number but not the winning category - and joining the aggregate back
to the detail on `(country, revenue)` produces two rows whenever two
categories tie exactly. Ranking keeps the row itself, which is what the report
needs.

The model answer uses `DISTINCT ON (country)` with `ORDER BY country, revenue
DESC, category` - the PostgreSQL idiom for "first row per key". The reference
uses `row_number() OVER (PARTITION BY country ORDER BY ...)` filtered to
`rn = 1`, which is portable and is the version to write in an interview
unless someone has said the word PostgreSQL. Either way the tie-break lives
inside the ranking, and the same tie-break has to be repeated in the final
`ORDER BY` if the output order matters.

## ex8 - the scorecard

Six columns, and the whole exercise is holding their definitions apart while
the join grain works against you. Units and revenue are sums over lines, so
the line grain suits them. Orders and buyers are counts of things that repeat
across lines, so they need `DISTINCT`. The average is over lines again.

The classic mistake is `count(o.id)` for the orders: a three-line order
contributes three, and the report claims three times the traffic. It is
plausible, it is never questioned, and it is the single most common defect in
hand-written analytics SQL.

The second is putting the final restriction in `WHERE`. It is a statement
about an aggregate of the group, which does not exist until the grouping has
happened, so it belongs in `HAVING` - where you must repeat the whole
expression, because `HAVING` cannot see `SELECT` aliases either. The
reference sidesteps that by computing the average in a subquery and filtering
it from outside, which is often the more readable arrangement once the
expression gets long.

## Further reading

- [PostgreSQL - GROUP BY and HAVING](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-GROUP) - what may appear in a `SELECT` list alongside aggregates, and why `HAVING` exists separately from `WHERE`. Behind ex1, ex4 and ex8.
- [PostgreSQL - Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - `count(DISTINCT ...)`, and the note that aggregate calls cannot be nested, which is the rule ex5 is built on.
- [PostgreSQL - Window Functions](https://www.postgresql.org/docs/16/tutorial-window.html) - `sum(x) OVER ()` for a grand total and `row_number() OVER (PARTITION BY ...)` for top-N-per-group. Behind ex6 and ex7.
- [PostgreSQL - SELECT: DISTINCT ON](https://www.postgresql.org/docs/16/sql-select.html#SQL-DISTINCT) - the shorter PostgreSQL-only route to "the best row per key" used in ex7.
- [PostgreSQL - Date/Time Functions: date_trunc](https://www.postgresql.org/docs/16/functions-datetime.html#FUNCTIONS-DATETIME-TRUNC) - how `date_trunc` behaves on `timestamptz`, including the time-zone question that decides which month a midnight order belongs to.
