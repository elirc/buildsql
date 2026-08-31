# Reading - 94_drills_frames_1

Eight drills on window frames and the moving statistics they produce. Read
after your attempt, pass or fail.

## Notes

A frame is the third and least-used part of an `OVER` clause, and it is where
moving averages live. The syntax is `ROWS|RANGE|GROUPS BETWEEN <start> AND
<end>`, with the bounds drawn from `UNBOUNDED PRECEDING`, `n PRECEDING`,
`CURRENT ROW`, `n FOLLOWING` and `UNBOUNDED FOLLOWING`. `ROWS` counts
positions: `2 PRECEDING` means two rows back, whatever their values. `RANGE`
counts values: with an ordered numeric or date column, `INTERVAL '6 days'
PRECEDING` means every row whose ordering value is within six days, however
many rows that is - and with no offset, `RANGE` treats all rows sharing an
ordering value as one indivisible peer group. That peer-group behaviour is the
default frame when a window has an `ORDER BY`, which is why exercise 6 exists
and why a running total over a non-unique ordering surprises people. Two
practical habits follow. Say `ROWS` explicitly whenever you mean "the previous
n rows", because the default is `RANGE` and it is not the same thing. And
remember that a `ROWS n PRECEDING` frame silently means "the previous n
**rows**", not "the previous n **days**" - on a series with a missing day, a
seven-row average quietly reaches eight days back. Where gaps are possible,
generate the calendar first (set 89) or use a `RANGE` frame with an interval
offset.

## ex1 - a centred three-month average

A frame with a `FOLLOWING` bound is the same machinery pointed both ways, and
it produces a smoother that does not lag behind the signal - which is the
right choice for looking at history and the wrong one for anything that has to
run in real time, because the future half of the frame does not exist yet. The
edges are the detail worth noticing: the first and last rows have no
neighbour on one side, so they average two values, and their `ma3` is
therefore noisier than the middle of the series. No `NULL`s appear, because
the frame is simply smaller.

## ex2 - a trailing three-month sum

`ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` is the shape of every "last N
periods" metric there is, and the count is inclusive of the current row - `2
PRECEDING` plus `CURRENT ROW` is three rows, not four. The classic
off-by-one is asking for a three-month total and writing `3 PRECEDING`. The
first two rows again sum over fewer rows rather than returning `NULL`; if you
need them blanked out, that is a `CASE` on the row number, not a frame.

## ex3 - the default frame, written out

The explicit frame and the reference's bare `OVER (ORDER BY month)` give
identical results here because `month` is unique - each row is its own peer
group, so `RANGE` and `ROWS` agree. Writing it out anyway is the safer habit,
because the day the ordering stops being unique the bare version changes
meaning silently. Note also that `max()` over a growing frame is a high-water
mark, which is a running maximum and not the same as the partition maximum you
would get with no `ORDER BY` at all.

## ex4 - looking forward instead of back

`CURRENT ROW AND UNBOUNDED FOLLOWING` is a reverse running total, useful for
burn-down and backlog reports: at every point it says how much is left. The
reference computes the same column as "the grand total minus everything
strictly before this row", which needs a `coalesce` because the frame
`UNBOUNDED PRECEDING AND 1 PRECEDING` is empty for the first row and `sum`
over an empty frame is `NULL`. That `NULL` is worth remembering - it is the
same reason a `lag()` on the first row is `NULL`.

## ex5 - a moving average inside each partition

Partition, order and frame together, which is the full `OVER` clause. Each
status gets its own 53-week series and its own moving average, and the frames
never cross a partition boundary - the first three weeks of each status
average over fewer rows, independently. The reference's correlated subquery
has to repeat the `n.status = w.status` correlation to reproduce that, which
is exactly the partition, spelled by hand.

## ex6 - ROWS against RANGE

Ninety-odd reviews across five ratings. `sum_rows` climbs one review at a
time; `sum_range` jumps in five steps, because every review sharing a rating is
a peer of every other and `RANGE` includes the current row's entire peer
group. Neither is a bug. `sum_range` is the answer to "the total for all
ratings at or below mine" and `sum_rows` is the answer to "the total up to my
position in this ordering" - and if your `ORDER BY` is unique you never have
to choose, which is why the distinction stays hidden for years and then
produces one very confusing report.

## ex7 - days that beat their own trend

A moving average used as a baseline rather than as output: compute it, compare
each day against it, keep the winners. The filter has to live one level up
because a window result cannot appear in `WHERE`, and the comparison uses the
raw average rather than the rounded one so that a day a hundredth above the
line is not thrown away by presentation. This query is the skeleton of every
anomaly-detection dashboard; swapping the seven-row frame for a longer one, or
comparing against a multiple of the average, is the whole of the tuning.

## ex8 - a moving-average crossover

Two frames of different lengths over the same series, with a `CASE` reading
the pair. The short average reacts quickly and the long one slowly, so
`signal` flips when the recent trend crosses the established one - the
classic technical-analysis indicator, here applied to weekly revenue. Two
things to note. Both averages are trailing, so this could be computed live.
And the first eleven weeks are not really comparable, because `ma12` is
averaging fewer than twelve weeks and is therefore closer to `ma4` than it
would otherwise be - a warm-up period every rolling indicator has and most
dashboards forget to hide.

## Further reading

- [Window Function Calls](https://www.postgresql.org/docs/16/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS) - the complete frame grammar, `ROWS` against `RANGE` against `GROUPS`, and `EXCLUDE`.
- [Window Functions](https://www.postgresql.org/docs/16/tutorial-window.html) - the introduction and the default frame.
- [Window Function Processing](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-WINDOW) - peer groups and why the default frame includes them.
- [Date/Time Functions](https://www.postgresql.org/docs/16/functions-datetime.html) - interval arithmetic, needed for `RANGE` frames measured in days or weeks.
