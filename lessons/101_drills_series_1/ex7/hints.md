## Hint 1

Two patterns stacked: build the zero-filled daily counts exactly as in ex3,
then accumulate over them. The calendar has to exist before the running
total, or the line would skip the empty days.

## Hint 2

Put the daily counts in a CTE, then `sum(orders) OVER (ORDER BY day)` in the
outer query - an ordered window with no frame clause already means "from the
start up to this row".

## Hint 3

If you prefer to be explicit, `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT
ROW` says the same thing and is worth writing out at least once so the
default stops being magic.
