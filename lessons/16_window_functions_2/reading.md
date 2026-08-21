# Reading - 16_window_functions_2

Adding `ORDER BY` inside `OVER` gives a window a direction, and direction is
what turns an aggregate into a *sequence* operator. Running totals,
period-over-period comparisons and moving averages are all the same
construct with different knobs — and together they are the grammar of every
time-series report you will ever write.

## Notes

**The frame is the real subject of this lesson.** A window function operates
on a *frame* within the partition. Without `ORDER BY` inside `OVER`, the
frame is the whole partition — that is why lesson 15's `avg(price) OVER
(PARTITION BY category)` gave every row the same value. **With** `ORDER BY`,
the default frame becomes `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT
ROW`: everything from the start of the partition up to here. That default is
precisely a running total, which is why `sum(x) OVER (ORDER BY d)` does what
you want without a frame clause.

**`ROWS` versus `RANGE`, and why it matters.** `ROWS BETWEEN 6 PRECEDING AND
CURRENT ROW` counts *physical rows*. `RANGE` counts *peers* — rows with the
same value in the `ORDER BY` — so with ties, `RANGE` includes all of them
and `ROWS` does not. The default frame uses `RANGE`, which means a running
total over a column with duplicate sort keys jumps by the whole tie group at
once rather than one row at a time. That is usually correct for a running
total by date and almost never what someone hand-rolling a moving average
expects. When you write a frame explicitly, say `ROWS` and mean it.
(PostgreSQL 11+ also has `GROUPS`, which counts tie-groups.)

**Moving averages have an edge problem.** `ROWS BETWEEN 6 PRECEDING AND
CURRENT ROW` on day 3 averages three rows, not seven, because only three
exist. That is what the function is defined to do, and it means the first
six points of any 7-day moving average are computed over a different
denominator. Charts that do not drop or mark those points show a spurious
ramp at the start of every series.

**`lag` and `lead` return NULL at the edges — on purpose.** There is no
previous month before the first month, and NULL is the honest answer.
Arithmetic then propagates it (lesson 05), so `revenue - lag(revenue)` is
NULL for the first row, which is exactly the right thing to display. Both
functions take an offset and a default: `lag(revenue, 12)` for year-over-
year, `lag(revenue, 1, 0)` to substitute zero. Use the default argument
sparingly — a zero at the edge of a growth calculation produces an infinite
percentage or a nonsense one.

**Divide-by-zero in growth calculations.** `100 * (revenue - prev) / prev`
raises an error when `prev` is zero and returns NULL when `prev` is NULL.
`nullif(prev, 0)` converts the first case into the second, which is the
standard defensive idiom for every percentage-change column.

**Aggregate first, then window.** All of this composes with lesson 14's
CTEs, and the order matters for performance: aggregate three million rows
into thirty-one daily rows, *then* window over thirty-one. Windowing the raw
rows would force a sort of the whole table for the same answer. This is one
of the most common performance smells in analytics SQL.

**What this replaces.** Before window functions were widely available,
running totals were written as self-joins with `t2.day <= t1.day` — which is
quadratic — or accumulated in application code, where they break the moment
someone paginates. When you see a Python loop adding up query results, you
are usually looking at a window function that escaped. Push it down: the
database sorts once, scans once, and the number is correct on every page.

## ex1 — running total

The default frame doing its job. Check the last row against the month's
total from a separate `sum()` — a running total whose final value does not
equal the plain aggregate means the frame or the partition is wrong.

Note the two-stage shape, which every exercise in this lesson repeats:
aggregate half a million orders down to 31 daily rows in a CTE, then window
over 31 rows. Windowing the raw orders would give the same answer and force
PostgreSQL to sort the whole table. Aggregate first, window second — it is
the single most useful performance habit in analytics SQL.

## ex2 — month-over-month with LAG

Thirteen rows, and the first `prev` is NULL. The `delta` column is NULL
there too, by propagation, which is the correct display for "no previous
month" — resist the urge to `coalesce` it to zero, which would claim growth
of exactly the first month's revenue.

## ex3 — 7-day moving average

The first explicit frame. Look at days 1 through 6 in the output: those
averages are over 1 to 6 rows respectively, not 7. Whether to show, drop or
flag them is a reporting decision, and it should be a conscious one.

## ex4 — a running total per partition

`PARTITION BY status ORDER BY day` — the partition resets the accumulation,
the order drives it. This is the point at which the two clauses inside
`OVER` become clearly independent in your head: one chooses *which rows*,
the other chooses *in what sequence*.

## ex5 — looking forward with LEAD

`lead` is `lag` with the sign flipped and the NULL at the other end. Useful
beyond reporting: `lead(created_at) OVER (PARTITION BY customer_id ORDER BY
created_at)` gives you each event's successor, and subtracting yields the
gap between consecutive events per customer — the foundation of sessionising
a clickstream, funnel analysis, and churn windows.

## ex6 — the best day so far

`max()` over the running frame. The generalisation is the useful part: every
aggregate becomes cumulative under the default ordered frame. `count(*)
OVER (ORDER BY day)` is a row number; `bool_or(revenue > 100000) OVER (ORDER
BY day)` is "has a record day happened yet"; `avg(x) OVER (ORDER BY d)` is
the cumulative mean.

## challenge — growth percentage, one query

The board-deck column, and the two traps are both edge cases: NULL for the
first month (correct), and division by zero if any month had zero revenue
(use `nullif(prev, 0)`). One `lag` can feed both the subtraction and the
division, or you can window once in a CTE and compute outside — the second
reads better and is easier to check.

## review1 — salary quartiles

`ntile(4)` deals rows into four near-equal buckets in frame order. "Near
equal" is the detail: when the row count is not divisible by the bucket
count, the earlier buckets get the extra rows. `ntile` also does not care
about ties — two people on identical salaries can land in different
quartiles, which is a genuine surprise on a compensation report and an
argument for `percent_rank()` or `cume_dist()` when the boundary matters.

## Further reading

- [Window Function Calls — frames](https://www.postgresql.org/docs/16/sql-expressions.html) — `ROWS`/`RANGE`/`GROUPS`, the default frame, and the exclusion clauses. The most important page in this lesson.
- [Window Functions](https://www.postgresql.org/docs/16/functions-window.html) — `lag`, `lead`, `first_value`, `last_value`, `nth_value`, `ntile`, `percent_rank`, `cume_dist`.
- [Window Functions Tutorial](https://www.postgresql.org/docs/16/tutorial-window.html) — worth a second read now that frames make sense.
- [Date/Time Functions](https://www.postgresql.org/docs/16/functions-datetime.html) — `date_trunc` and interval arithmetic, which every one of these exercises leans on. Lesson 18 next.
