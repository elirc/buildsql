# Reading - 92_drills_windows_3

Eight drills on the window's own `ORDER BY` and the running totals it
produces. Read after your attempt, pass or fail.

## Notes

Adding `ORDER BY` inside `OVER (...)` does two things at once, and only the
first is obvious. It sorts the partition, and it changes the default frame.
With no `ORDER BY`, the frame is the entire partition, so `sum` gives a total.
With an `ORDER BY`, the default frame becomes `RANGE BETWEEN UNBOUNDED
PRECEDING AND CURRENT ROW` - everything from the start of the partition up to
and including the current row **and its peers**. That last phrase is the whole
of exercise 4. `RANGE` defines "current row" in terms of the ordering *values*,
so every row with the same `department` is one peer group and they all see the
same frame; switch the frame to `ROWS` and the boundary becomes positional, so
each row sees exactly the rows before it. When the `ORDER BY` is unique the
two are indistinguishable, which is why the difference goes unnoticed until it
produces a report where fifty people appear to have identical cumulative
totals. The habit that avoids it entirely: make your window `ORDER BY` unique
by appending a key, or say `ROWS` explicitly. Set 94 takes frames apart
properly; this set is about noticing that they exist.

## ex1 - a running total over six rows

The smallest running total there is, and a good place to check a detail: the
window's `ORDER BY` and the query's final `ORDER BY` are separate clauses that
happen to agree here. They do not have to - exercise 7 makes them disagree on
purpose - and a query with a window `ORDER BY` but no outer one returns rows in
an unspecified order with a correctly computed running total, which looks
broken and is not. Note also that `sum()` over a `bigint` returns `numeric`,
which is why the column comes back with no thousands rounding issues.

## ex2 - headcount over time

`count(*)` with an ordered window is a running count, and pointing it at
`hired_on` turns the staff table into a growth curve. The tie-break on `id`
does real work here: several people share a hire date, and without the
tie-break the `RANGE` frame would give all of them the same "headcount so
far", which is arguably the more correct answer to the question and definitely
not the one the prompt asks for. The reference's correlated `count(*)` over a
row constructor - `(t.hired_on, t.id) <= (s.hired_on, s.id)` - is the exact
translation of the ordered frame into a predicate.

## ex3 - a running total that restarts per customer

`PARTITION BY` and `ORDER BY` in the same `OVER` clause: the accumulation
resets at every partition boundary. This is the running-balance report, and
the only thing to be careful about is that the partition key must be the thing
the balance belongs to. The classic mistake is ordering by `id` alone and
calling it chronological; order ids and timestamps are correlated in this
dataset but not identical, so the two spellings give different running totals
for the same customer.

## ex4 - two running totals that disagree

Five departments, five distinct values of the first column, five hundred
distinct values of the second. `ORDER BY department` puts every member of a
department in one peer group, and the default `RANGE` frame includes all peers
of the current row, so each of them sees the whole department; the column is
therefore a *cumulative departmental subtotal*, not a running total.
`ORDER BY department, id` makes every row its own peer group and the column
becomes a true row-by-row accumulation. Neither is wrong; confusing them is.
The reference writes both frames out in full, which is the version to reach
for whenever a reader might have to guess.

## ex5 - how much of the year is behind us

Two windows over the same rows, one ordered and one not: the ordered one is
the running total, the unordered one is the grand total, and their ratio is
the share of the year completed. Writing the denominator as `sum(revenue)`
without `OVER ()` would be an aggregate over a query that is not grouped and
PostgreSQL would reject it. This is also the cheapest way to get a "percent
complete" column without a second scan or a self-join.

## ex6 - the same thing by week

Identical machinery at a different grain, with one wrinkle worth knowing:
`date_trunc('week', ...)` uses the ISO definition and starts weeks on Monday,
so the first and last weeks of the series are partial and their revenue is
correspondingly lower. That is not a bug in the query, but it is the first
thing to explain when somebody points at the chart. Fifty-three weeks come
back because a 366-day span crossing a year boundary touches 53 ISO weeks.

## ex7 - accumulate in two different orders at once

Two windows differing only in their `ORDER BY`, evaluated over the same
thirteen rows in the same pass. The second column is the answer to "how much
revenue do the best months account for", read off against a month you can
locate in the first column - a compact way to show concentration without a
second query. Note that the outer `ORDER BY month` governs the output while
neither window's ordering does; the window orderings only decide which rows
fall inside each frame.

## ex8 - the countries that make up 80% of the customer base

The Pareto or ABC report: sort by size, accumulate, cut at a threshold. Two
things make it a good final exercise. The cumulative percentage is a window
divided by a window, and the filter is on a window result, so it needs the
extra CTE level that windows always need. And the cut is deliberately "rows
whose cumulative share is at or below 80%", which stops one row *before* the
80% mark is crossed - the other convention, "up to and including the row that
crosses it", needs the previous row's cumulative value and is a `lag()`
problem, which is set 95.

## Further reading

- [Window Function Calls](https://www.postgresql.org/docs/16/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS) - the frame clause grammar and the default frame that exercise 4 turns on.
- [Window Functions](https://www.postgresql.org/docs/16/tutorial-window.html) - the introduction, including the `PARTITION BY` plus `ORDER BY` combination.
- [Date/Time Functions](https://www.postgresql.org/docs/16/functions-datetime.html) - `date_trunc` and the ISO week definition behind exercise 6.
- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - the return types of `sum` and `count`, and which aggregates work as window functions.
