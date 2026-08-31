# Reading - 109_drills_reports_1

Eight requests translated from manager-speak. Read after your attempt, pass
or fail.

## Notes

The hard part of report work is rarely the SQL - it is the translation
table between prose and clauses. "Real revenue" is a status filter;
"October" is a half-open timestamp range; "rate" is a filtered count over a
total count with 100.0 doing the decimal work; "gone quiet since" is a
condition on max(), which only HAVING can see; "on average, how long until"
is a two-stage pipeline because the thing being averaged must be computed
per customer first. Every exercise here is one of those translations plus
machinery you already drilled. The habit worth building: before typing,
write the population in one sentence (whose rows count?), the grain (one
row per what?), and the measure - then check the finished query against all
three. Most wrong reports fail the population test, not the arithmetic.

## ex1

Three aggregates, one filtered scan, no grouping. What it tested: turning
"October, paid" into a half-open range plus a status equality without
over-thinking it. The classic mistake is `BETWEEN '2023-10-01' AND
'2023-10-31'`, which silently drops all of October 31st past midnight -
lesson 18's oldest lesson. The model answer filters once and lets count,
sum, and avg share the pass.

## ex2

The same population at week grain. What it tested: knowing
date_trunc('week', ...) starts weeks on Monday, so October's first "week"
begins September 25th and the month's edges land in partial buckets. The
classic mistake is assuming week one starts October 1st and treating the
low first bar as a sales dip. Deliver edge-bucket caveats with the chart,
not after the panicked reply-all.

## ex3

A join for the dimension, a filter for the population, an ordered LIMIT
for the "top". What it tested: assembling the standard revenue-by-X shape
quickly and pinning the tie-break (country ASC) so eighth place is
deterministic. The classic mistake is grouping by the customer instead of
the country, or forgetting that "since the quarter started" needs no upper
bound - the data ends when it ends.

## ex4

A rate per bucket: total count and conditional count over the same groups.
What it tested: count(*) FILTER (WHERE ...) - lesson 06 - plus the 100.0
multiplier that keeps the division out of integer arithmetic. The classic
mistake is computing cancelled counts in one query and totals in another
and dividing in a spreadsheet; the single-pass version cannot drift out of
sync with itself.

## ex5

The two-grain pipeline in its purest form: the wait (first order minus
signup) exists per customer, so it must be computed per customer before it
can be averaged per year. What it tested: min() at one grain feeding avg()
at another, date subtraction yielding integer days, and the population
sentence - "of the people who did buy" - which the inner join implements
for free. The classic mistake is joining and averaging in one grouped pass
over order rows, which weights frequent buyers' waits more heavily; the
reference's DISTINCT ON firsts makes the per-customer stage explicit.

## ex6

A two-column pivot with the pivot condition on a *different table* than
the measure: the day-of-week comes from the order, the money from the
line. What it tested: lesson 17's FILTER pivot after a three-table join,
and extract(isodow ...) where Saturday is 6 - isodow, not dow, whose
Sunday-is-zero convention has ruined many weekend reports. The classic
mistake is pivoting on the line's own attributes and wondering why the
weekend column looks random.

## ex7

lag() over a pre-aggregated CTE, then two derived columns comparing the
same pair of numbers. What it tested: lesson 16's frame-free lag, NULL
propagation doing the January edge case for free in the percentage, and an
explicit CASE for the label. The classic mistake is dividing by the
current month instead of the previous one - growth is measured against
where you were - or forgetting that the trend CASE needs its NULL branch
first, before the comparisons.

## ex8

"Gone quiet" is a property of the group, not of any row: their *latest*
order predates the cutoff. What it tested: HAVING on max(created_at) while
sum() rides the same grouped pass, and the difference between that and a
WHERE on created_at - which computes September-era revenue and hides
customers who ordered since, a different and wronger report. The model
reasoning: row filters change the money; group filters change only who
qualifies. Chose the wrong one and both numbers lie.

## Further reading

- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - FILTER syntax and every aggregate used in this set.
- [Date/Time Functions and Operators](https://www.postgresql.org/docs/16/functions-datetime.html) - date_trunc grains, extract(isodow), interval arithmetic.
- [Window Functions](https://www.postgresql.org/docs/16/functions-window.html) - lag() and friends for month-over-month shapes.
- [SELECT - HAVING](https://www.postgresql.org/docs/16/sql-select.html#SQL-HAVING) - conditions on groups versus conditions on rows, in the reference grammar.
