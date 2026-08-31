# Reading - 97_drills_pivots_1

Eight drills on conditional aggregates - the technique behind every
cross-tab, dashboard grid, and "columns per status" report. Read after your
attempt, pass or fail.

## Notes

A pivot is not a special feature; it is an aggregate that ignores part of
its group. `count(*) FILTER (WHERE status = 'paid')` counts only the rows of
the group that satisfy the predicate, and `count(CASE WHEN status = 'paid'
THEN 1 END)` does the same thing by handing `count` a NULL for every row it
should ignore - the two compile to nearly identical plans, and `FILTER`
exists because the CASE version is easy to get subtly wrong. The important
consequences: the number of output columns is fixed when you write the query,
so a genuinely dynamic pivot needs code generation or `crosstab()` from the
`tablefuncs` extension; every column is computed in one pass over the group,
so a six-column pivot is not six scans; and `count(CASE ... THEN 1 ELSE 0
END)` is the classic bug, because `count` counts zeros happily - it is
`sum` that wants the `ELSE 0`, and `count` that wants no `ELSE` at all.

## ex1 - the whole catalogue on one line

What this tested: that a pivot does not require a `GROUP BY`. With no
grouping clause the whole table is one group, so six filtered counts produce
six columns and exactly one row. The classic mistake is writing `GROUP BY
category` out of habit and getting the six categories back down the page
instead of across it - which is the same information in the shape you were
asked not to produce. The model answer treats the category names as part of
the query text, which is exactly what makes a pivot static.

## ex2 - a rating histogram per product

What this tested: the same five aggregates repeated inside a real group.
Products with no reviews simply do not appear, because `GROUP BY` forms
groups from rows that exist - so nineteen or twenty rows are both plausible
answers and neither indicates a bug. The classic mistake is `count(CASE WHEN
rating = 1 THEN 1 ELSE 0 END)`, which returns the group size in every column
because zero is not NULL. The model answer uses `FILTER` and never has to
think about it.

## ex3 - the monthly status grid

What this tested: pivoting on a computed grouping key. `date_trunc` collapses
timestamps to the month boundary, and the four filtered counts then split
each month across the statuses. The classic mistake is to filter the status
in `WHERE` as well as in the aggregate, which silently empties three of the
four columns - the `WHERE` clause governs which rows reach the group, and a
pivot needs all of them. Thirteen rows is right: a year of data starting
mid-November touches thirteen calendar months.

## ex4 - money instead of counts

What this tested: `FILTER` works on any aggregate, not just `count`, and a
period split is just another predicate. `sum(total) FILTER (WHERE created_at
< DATE '2023-01-01')` reads as the sentence it implements. The classic
mistake is `extract(year FROM created_at) = 2022`, which is correct here but
cannot use an index on `created_at` and quietly changes meaning the moment a
time zone is involved. The model reasoning: state the boundary once, as a
half-open range, and both columns follow from it.

## ex5 - a filtered count over an unfiltered one

What this tested: a pivot column and a plain aggregate in the same SELECT
list, then arithmetic over both. Two traps live here. Output aliases are not
visible to other expressions in the same SELECT list, so the ratio has to
repeat the aggregates; and integer division would floor the ratio to zero,
which is why the numerator carries `100.0` and drags the whole expression
into `numeric`. The model answer rounds only at the end, never mid-way.

## ex6 - a clickstream profile

What this tested: a five-column pivot on a text dimension, over the biggest
table in the dataset. Behaviour profiles like this one - views, clicks,
carts, purchases side by side per user - are the reason conditional
aggregates exist, because the alternative is five separate scans stitched
together with joins. The classic mistake is joining `events` to itself once
per event type; the model answer reads each qualifying row exactly once and
lets the filters decide which counter it lands in.

## ex7 - conversion by country

What this tested: pivoting across an outer join, where the arithmetic is
easy and the counting is not. `count(*)` after a `LEFT JOIN` counts joined
rows, not customers, so a customer with nine orders would count nine times -
hence `count(DISTINCT c.id)`, or the reference's approach of reducing orders
to one row per paying customer *before* the join so an ordinary `count` is
correct again. The classic mistake is an inner join, which drops the 5,003
customers who never ordered and inflates every percentage.

## ex8 - a pivot with a memory

What this tested: the layering rule. Window functions run after aggregation,
so `lag(count(*) FILTER (...))` in a single level is legal but confusing,
while an aggregate over a window function is outright rejected - the reliable
habit is one CTE per stage: pivot to months, derive the rate, then look back
one row. The classic mistake is dividing by `paid` instead of by `paid +
cancelled` and calling it a cancellation rate. The model answer computes the
rate once, in its own CTE, and lets `lag()` reuse it.

## Further reading

- [Aggregate Expressions and `FILTER`](https://www.postgresql.org/docs/16/sql-expressions.html#SYNTAX-AGGREGATES) - the full syntax, including `FILTER` with `DISTINCT` and `ORDER BY`.
- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - what `count`, `sum` and `avg` do with NULL inputs, which is the whole trick behind the CASE form.
- [Conditional Expressions](https://www.postgresql.org/docs/16/functions-conditional.html) - `CASE`, `COALESCE`, `NULLIF` and the rule that a missing `ELSE` yields NULL.
- [`tablefunc` and `crosstab()`](https://www.postgresql.org/docs/16/tablefunc.html) - the extension for when the column list is genuinely not known in advance.
