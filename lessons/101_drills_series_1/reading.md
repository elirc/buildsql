# Reading - 101_drills_series_1

Eight drills on generating the rows your data does not contain. Read after
your attempt, pass or fail.

## Notes

Every "zero rows for Tuesday" bug has the same cause and the same fix.
`GROUP BY` builds groups out of rows that exist, so a period with no data
produces no group, and the gap in the report is indistinguishable from a
gap in the chart's x-axis. `generate_series` manufactures the periods
independently of the data - it takes a start, a stop (inclusive) and a step,
and works for integers, numerics and timestamps alike - and the calendar
then becomes the left side of a `LEFT JOIN`. Two details make or break the
pattern. Count the *data's* key, `count(o.id)`, not `count(*)`: after an
outer join every calendar row has at least one row, so `count(*)` reports 1
for the empty days. And put the data-side restrictions in the join condition
or in a pre-aggregated CTE, never in the outer `WHERE`, because a `WHERE`
clause that mentions the right-hand table turns your outer join back into an
inner one and deletes the very rows you generated. Pre-aggregating is also
the faster shape: reduce the big table to one row per bucket first, then
join a few dozen calendar rows to a few dozen aggregate rows.

## ex1 - a month of days

What this tested: the bare mechanics. `generate_series(DATE '2023-01-01',
DATE '2023-01-31', interval '1 day')` yields timestamps, so the cast to
`date` is part of the answer, and the stop value is *inclusive* - unlike
almost every range convention in this course, which is worth remembering
before you write `- interval '1 day'` out of habit. It may be called in the
SELECT list or in `FROM`; the `FROM` form is the one that composes.

## ex2 - the twelve month starts

What this tested: that the step can be any interval, months included, and
that month steps are calendar-aware rather than 30-day approximations. The
reference builds the same list from `generate_series(0, 11)` plus month
arithmetic, which is the version to reach for when the periods are not
evenly spaced. The classic mistake is `'Mon'` versus `'MON'` versus `'mon'` -
`to_char` copies the case of the pattern into the output.

## ex3 - every day of March, orders or not

What this tested: the calendar `LEFT JOIN`, in its simplest form. Two things
have to be right at once: the join must be from the calendar to the data,
and the count must be of a column from the data side. `count(*)` would
return 1 for every empty day, which is the single most common bug in this
whole pattern - and a plausible-looking one, because 1 is not obviously
wrong. March happens to have orders every day, which is exactly why this is
a drill and not a discovery.

## ex4 - all twenty-four hours

What this tested: that the spine does not have to be dates. Twenty-four
integers make a perfectly good calendar, joined against the extracted hour;
the reference generates 24 timestamps an hour apart instead and joins on
`date_trunc('hour', ...)`, which generalises better when the report spans
more than one day. The classic mistake is filtering the day in the outer
`WHERE` after an outer join, which silently drops the hours with no orders.

## ex5 - the weeks nobody was hired

What this tested: the anti-join against a generated spine - "which periods
are missing" rather than "how many in each period". `NOT EXISTS` over the
week's half-open range says it directly; the reference's `LEFT JOIN ...
WHERE s.id IS NULL` says the same thing and is the form you will meet more
often. The classic mistake is `hired_on BETWEEN week_start AND week_start +
7`, which makes each week eight days long and lets a Monday hire suppress
two weeks at once.

## ex6 - a histogram with empty bars

What this tested: a numeric series. Buckets are the same problem as days -
an empty bar must still be drawn - and `generate_series(0, 450, 50)` gives
you the bar labels regardless of what the data contains. Compare it with the
`floor(price / 50) * 50` grouping you have written before: that version is
shorter and cannot produce an empty bucket, which makes it right for
exploration and wrong for a chart with a fixed axis.

## ex7 - a running total over a calendar

What this tested: the composition of two patterns. The calendar guarantees
28 rows, and the window function then accumulates over them - which is
precisely why the calendar matters: a running total computed over only the
days that had orders would still be correct at each point but would draw a
misleading line, jumping from the 3rd to the 6th as if nothing happened
between. The model answer aggregates per day first, then sums over the
ordered days with the default running frame.

## ex8 - a dense grid, two dimensions

What this tested: that a spine can have more than one axis. Cross-joining
three departments with twelve months produces the 36 cells the report needs,
and the `LEFT JOIN` fills the ones that have data - the same shape as a
pivot table's skeleton, built explicitly. The classic mistake is joining
`staff` to the months and grouping by department, which produces only the
department-months that actually contain a hire and leaves the report with
ragged rows.

## Further reading

- [Set Returning Functions](https://www.postgresql.org/docs/16/functions-srf.html) - `generate_series` for numbers and timestamps, and the inclusive stop value.
- [Table Expressions - joins](https://www.postgresql.org/docs/16/queries-table-expressions.html) - what `LEFT JOIN` does with unmatched rows, and why a `WHERE` on the right side undoes it.
- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - `count(*)` against `count(expression)`, the distinction that makes the zero-fill work.
- [Window Function Calls](https://www.postgresql.org/docs/16/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS) - the default frame used by the running total in ex7.
