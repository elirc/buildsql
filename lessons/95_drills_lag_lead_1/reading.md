# Reading - 95_drills_lag_lead_1

Eight drills on reading a neighbouring row without a self-join. Read after
your attempt, pass or fail.

## Notes

`lag()` and `lead()` are positional: they fetch a value from N rows away in
the order the OVER clause declares, and nothing else. Three consequences run
through this whole set. First, the ORDER BY inside the OVER is part of the
answer's meaning - an unstated tie-break makes the result random, which is
why every window here carries one. Second, the edges produce NULL, and
almost always the NULL is the truthful answer; the optional third argument
that substitutes a default is for the rare case where a made-up number is
better than an honest blank. Third, windows are computed after WHERE and
GROUP BY, so "aggregate first, then window over the small result" is the
shape of every exercise from ex1 on, and "filter on the window's value in
an outer query" is the shape of ex8. LAG sees the previous *row*, not the
previous *day* - if a day were missing from the daily CTE, `lag(..., 1)`
would silently reach one day further back. This dataset has orders every
day, but production data does not; lesson 101 fixes that with a generated
calendar.

## ex1 - yesterday's number beside today's

What it tests: the two-step rhythm - GROUP BY to one row per day in a CTE,
then LAG over the days. The classic mistake is trying to write
`lag(count(*))` and an ORDER BY into one query level and fighting the
planner's evaluation order; it works here by accident of syntax but reads
backwards. The model answer aggregates first because a window over 500,000
raw orders answers a different question than a window over 30 daily rows.

## ex2 - the next hire

What it tests: LEAD is LAG mirrored, and the edge NULL moves to the other
end of the series. The classic mistake is leaving the tie-break out of
`OVER (ORDER BY hired_on)` - two engineers hired the same day would then
swap `next_hire` values from run to run and the gate would fail
intermittently. The model answer orders the window and the output by the
same (`hired_on`, `id`) pair, which is the habit worth automating.

## ex3 - the same weekday last week

What it tests: the offset argument. `lag(revenue, 7)` compares Tuesday to
Tuesday, which is what a week-over-week report means; `lag(revenue)` would
compare Tuesday to Monday and look plausible while being wrong. The classic
mistake is patching the seven leading NULLs with the default argument -
`lag(revenue, 7, 0)` - which invents a zero-revenue week and makes the
first real week look like infinite growth. The model answer leaves NULL
meaning "no such week".

## ex4 - the gap between two orders

What it tests: LAG on a timestamp and interval arithmetic in one step -
`created_at - lag(created_at) OVER (...)` is the whole idea. The classic
mistake before window functions was a self-join on `o2.created_at <
o1.created_at` with a `max()` underneath, quadratic and hard to read. The
model reasoning: the subtraction happens per row, the NULL for the first
order propagates through the arithmetic exactly as lesson 05 promised, and
no join ever enters the picture.

## ex5 - a LAG that restarts per group

What it tests: PARTITION BY as the reset switch. Without it, the window
runs across category boundaries and the first toy inherits a price from the
last garden tool. The classic mistake is partitioning correctly but
ordering only by `price` - equal prices then make `prev_in_cat`
nondeterministic. The model answer puts (`price`, `id`) in the window and
the same keys plus `category` in the outer ORDER BY, so both the values and
the row order are fully pinned down.

## ex6 - rating swings

What it tests: deriving two columns from one LAG. Writing the OVER clause
twice is fine - PostgreSQL computes identical windows once - but the CTE
formulation (window inside, arithmetic outside) is easier to extend when a
third derived column shows up. The classic mistake is ordering the window
by `id` alone on the theory that ids follow time; review ids are assigned
in insert order, not review-date order, so the trajectory would be
scrambled. Order by the timestamp the question is about.

## ex7 - the longest silence

What it tests: window output as aggregate input - the two-layer pattern
that answers most "extreme gap" interview questions. The layers cannot be
merged: `max(ts - lag(ts) OVER (...))` in one SELECT is rejected because
aggregates cannot take window results in the same level. The classic
mistake is forgetting PARTITION BY, which measures a phantom gap from one
customer's last event to the next customer's first. The model answer also
leans on `max()` ignoring the NULL that each customer's first event
carries.

## ex8 - local minima

What it tests: LAG and LEAD on the same row, then filtering on window
output from an outer query - windows are evaluated after WHERE, so the
comparison must live one level up. The classic mistake is expecting July
1st or 31st to appear: `revenue < NULL` is NULL, NULL is not true, and the
edge days drop out - correct behaviour, since a day with one neighbour
cannot be a local minimum. The model answer reads as a pipeline: daily
CTE, neighbour CTE, one WHERE.

## Further reading

- [Window Functions tutorial](https://www.postgresql.org/docs/16/tutorial-window.html) - the mental model: partitions, frames, and when each function sees what.
- [Window Function Calls](https://www.postgresql.org/docs/16/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS) - full syntax of OVER, including ordering and the rules for what may appear where.
- [General-Purpose Window Functions](https://www.postgresql.org/docs/16/functions-window.html) - `lag`, `lead`, offsets and defaults, and their edge behaviour.
- [Use The Index, Luke - on pagination and offsets](https://use-the-index-luke.com/sql/partial-results/window-functions) - window functions from the performance side.
