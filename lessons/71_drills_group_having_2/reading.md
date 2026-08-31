# Reading - 71_drills_group_having_2

Eight drills on grouping by something you compute rather than something you
stored. Read after your attempt.

## Notes

Any expression can be a grouping key, and that single permission is what
turns `GROUP BY` from a lookup-table summariser into a reporting engine.
`date_trunc('month', ts)` maps every timestamp in a month onto the month's
first instant, so grouping by it groups by month; `CASE` maps a continuous
measure onto named tiers; a boolean expression splits a table in two;
`extract` pulls out a calendar component. The mechanics are always the same:
the expression appears in `GROUP BY` (by ordinal, or written out in full),
and the identical expression appears in the SELECT list so the reader can see
which bucket a row is. Two consequences follow. Rows the expression maps to
the same value become one row, so choosing the expression is choosing the
grain of the report. And a period with no rows produces no group at all -
`GROUP BY` can only describe data that exists, which is why a monthly chart
with a missing month needs a generated series and an outer join rather than a
better aggregate.

## ex1 - reviews per month

The per-period report, and the reason `date_trunc` exists. Keeping the key as
a timestamp rather than a formatted string matters for two reasons: it sorts
chronologically for free, and it can be compared with other timestamps
downstream. The first and last months of any range are partial - this data
starts and ends mid-November - so the first and last bars of the chart are
always shorter, and a report that does not say so misleads whoever reads the
trend.

## ex2 - two grouping keys

Multi-key grouping produces the cross-product of the keys, but only for
combinations that exist in the data - a quarter in which nothing was
cancelled simply has no cancelled row, and the reader has to notice the
absence. This is the long, tall form of a cross-tab; lesson 17 turns exactly
this result sideways so a human can read it, and lesson 50 shows how to get
per-status subtotals and a grand total in the same pass with `GROUPING SETS`.

## ex3 - grouping by a piece of a string

Grouping by a computed prefix is the cheap way to profile a text column - to
see the shape of a distribution, spot the rows that start with a space or a
digit, or size the buckets before you build an index. The `upper` matters:
without it, case variants form separate groups, which is how a "clean" data
set turns out to have two entries for every letter. Note that this grouping
key cannot use a plain B-tree index on `name` either; an expression index
(lesson 40) is what would serve it.

## ex4 - grouping by a boolean

A boolean grouping key is the shortest way to write a two-bucket comparison,
and it keeps the threshold in exactly one place instead of repeating it in
two `FILTER` clauses. It is also a good demonstration that the grouping key
is whatever the expression returns, not necessarily something stored. One
caution: if the column were nullable, this expression would produce a third
group - NULL - and a two-row report would silently become three.

## ex5 - CASE buckets and a share of the whole

Two ideas at once: a computed grouping key, and a percentage whose
denominator lives outside the group. The subquery is the part worth
internalising - inside a grouped query every aggregate refers to the current
group, so the total across all groups has to come from somewhere else. (A
window function, `sum(count(*)) OVER ()`, is the other way to write it, and
lesson 16 covers that.) The classic mistake is `100.0 * count(*) /
count(*)`, which is always exactly 100.

## ex6 - grouping by a calendar component

`date_trunc` groups a timeline into consecutive periods; `extract` folds the
whole timeline onto a repeating cycle, which is a different question -
"what happened in March" versus "what happens on Tuesdays". Seasonality
reports are all `extract`. Two traps: `dow` and `isodow` number the week
differently, and both interpret the timestamp in the session time zone, so a
report computed in UTC and one computed in local time can disagree about
which day an evening order belongs to.

## ex7 - a computed rate, filtered by HAVING

A `HAVING` clause is not restricted to a single aggregate - any expression
built from aggregates of the group is fair game, including a rate. The
repetition is annoying and unavoidable in one query; the alternative is the
CTE pattern from the previous lesson, computing the rate once and filtering
it with `WHERE` outside. Filtering on the rounded column would also be
subtly different: a month at 16.699 rounds to 16.7 and would then fail a
`> 16.7` test that its rounded display value looks like it should pass.

## ex8 - grouping the output of a grouping

A distribution of a distribution: the inner `GROUP BY` decides what one row
means, the outer one summarises those rows, and the meaning of `count(*)`
changes between the two levels. This is the same two-stage shape as the
average-of-counts drill in lesson 67, and it is worth being able to see the
boundary immediately, because "how many customers have N orders" and "how
many orders do customers have" are different questions with almost identical
English. Note the alphabetical ordering the prompt demands: text buckets sort
as text, which is why real reports usually carry a separate sort key.

## Further reading

- [Date/Time Functions and Operators](https://www.postgresql.org/docs/16/functions-datetime.html) - `date_trunc`, `extract`, and the field names each accepts.
- [Conditional Expressions](https://www.postgresql.org/docs/16/functions-conditional.html) - `CASE`, and why the first matching branch wins.
- [`GROUP BY` and `HAVING`](https://www.postgresql.org/docs/16/queries-table-expressions.html) - grouping by expressions, ordinals and output aliases.
- [String Functions and Operators](https://www.postgresql.org/docs/16/functions-string.html) - `left`, `upper` and friends, used as a grouping key in exercise 3.
