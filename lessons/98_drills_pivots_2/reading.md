# Reading - 98_drills_pivots_2

Eight drills on the harder half of conditional aggregation: pivots over
joins, pivots that carry averages and booleans, and the reverse operation -
un-pivoting a wide row back into rows. Read after your attempt, pass or
fail.

## Notes

Pivoting is a presentation decision, and the second half of the skill is
being able to undo it. Wide is what a human reads; tall - one row per
(entity, measure, value) - is what a chart library, a `GROUP BY`, and a
window function all want, because the measure names have become data instead
of schema. `CROSS JOIN LATERAL (VALUES ...)` is the compact way back: each
input row is expanded into one row per named column, and the column name is
supplied as a literal alongside its value. `UNION ALL` of one `SELECT` per
column does the same job in more lines and scans the source once per column
unless you materialize it first. Note also what changes when the aggregate
is not `count`: `avg(x) FILTER (WHERE ...)` returns NULL rather than zero
for an empty subset, which is the honest answer - "no such products" is not
"average price zero" - and booleans built from aggregates
(`count(*) FILTER (...) = 0`) are how you express "every" and "any" without
leaving the group.

## ex1 - averages of subsets

What this tested: `FILTER` on `avg`, and the fact that an empty subset gives
NULL, not 0. Every category here has products in both bands, so nothing is
NULL - but knowing which of the two you would get is the point, because
`coalesce(avg(...) FILTER (...), 0)` is a decision, and a silent one is a
bug. The classic mistake is averaging the rounded prices or rounding each
price first; round the aggregate, once, at the end.

## ex2 - weekday against weekend

What this tested: a pivot whose predicate is a computed value rather than a
stored column. `extract(dow FROM created_at)` numbers Sunday 0 through
Saturday 6, so the weekend test is `IN (0, 6)` - an off-by-one here is the
single most common date bug in reporting code, because `isodow` numbers
Monday 1 through Sunday 7 instead. The model answer derives `weekday` with
the complementary predicate, so the two columns always sum to `orders`.

## ex3 - a yes/no column

What this tested: turning an aggregate into a boolean. "Nobody in this
department was hired after 2022" is a claim about the whole group, which is
exactly what an aggregate is - either `count(*) FILTER (WHERE hired_on >=
DATE '2022-01-01') = 0` or, as the reference has it, `max(hired_on) < DATE
'2022-01-01'`. The classic mistake is a `WHERE hired_on < DATE '2022-01-01'`
that removes the very rows the claim is about, leaving every department
looking compliant. Filter inside the aggregate, never outside, when the
question is about all of the group.

## ex4 - sentiment by category

What this tested: pivoting after a join, where the group is defined by one
table and the measured rows come from another. The rating bands are three
filtered counts over `reviews`, and `avg(rating)` runs over the same rows
untouched, so the row that lands in `negative` also contributes to the
average - which is what you want, and worth stating aloud because it is the
part people misread. The classic mistake is joining `products` to `reviews`
and then also filtering the rating in `WHERE`, which empties two of the
three bands.

## ex5 - the same numbers, tall instead of wide

What this tested: un-pivoting. The wide grid is built first, in a CTE, and
then each of its rows is expanded into three by a `LATERAL` join against a
`VALUES` list that pairs a label with the matching column. The classic
mistake is trying to skip the wide stage and produce bands directly with a
`CASE` expression in `GROUP BY` - which is a perfectly good query, but it is
not un-pivoting, and it silently drops bands that no product falls into. The
model reasoning: once the band name is a value, the result can be grouped,
joined, and ranked like any other data.

## ex6 - the grid transposed

What this tested: that the choice of grouping key and the choice of filtered
columns are independent - swap them and the same join produces the transpose.
It is worth doing once to feel how arbitrary the wide layout is: neither
orientation is more "correct" than the other, and both are derived from the
same tall relation of (category, rating, count). The classic mistake is
assuming the categories can be discovered at runtime; they cannot, because
the SELECT list is fixed before the query runs.

## ex7 - new against returning

What this tested: a pivot whose predicate compares a row against an
aggregate computed elsewhere. Each customer's first-order month comes from
its own CTE; join it back and the split into new and returning is one
comparison. The classic mistake is `count(*) FILTER (...)` instead of
`count(DISTINCT customer_id) FILTER (...)`, which counts orders and lets one
enthusiastic buyer look like six new customers. The two columns are
mutually exclusive by construction - a month is either the first month or
after it - which is the property that makes the report trustworthy.

## ex8 - pivot, un-pivot, then rank

What this tested: the whole pipeline in one query - aggregate to a grid,
un-pivot it so the status names become data, then rank within each month and
keep the winner. It is worth noticing that the ranking step is *impossible*
while the statuses are columns: `row_number() OVER (PARTITION BY month ORDER
BY orders DESC)` needs one row per status. The classic mistake is a
`greatest(pending, paid, shipped, cancelled)`, which finds the winning
*number* but cannot tell you which column it came from. Un-pivoting is what
turns a lookup into a sort.

## Further reading

- [Aggregate Expressions and `FILTER`](https://www.postgresql.org/docs/16/sql-expressions.html#SYNTAX-AGGREGATES) - the syntax, and where `FILTER` may and may not appear.
- [`VALUES` lists](https://www.postgresql.org/docs/16/queries-values.html) - the inline table that makes un-pivoting compact.
- [`LATERAL` subqueries](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-LATERAL) - why a `VALUES` list may refer to columns of the row on its left.
- [Date/Time Functions - `extract`](https://www.postgresql.org/docs/16/functions-datetime.html#FUNCTIONS-DATETIME-EXTRACT) - `dow` against `isodow`, and the rest of the fields.
