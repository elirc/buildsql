## Hint 1

Four stages, each one a CTE: pivot to the grid, un-pivot it so the status
names become values, number the rows inside each month by their count, keep
number one.

## Hint 2

The ranking cannot happen while the statuses are columns - `row_number()
OVER (PARTITION BY month ORDER BY orders DESC)` needs one row per status.
That is the reason the un-pivot is in the query at all.

## Hint 3

Break the tie with `status ASC` inside the window's `ORDER BY` so exactly one
row survives per month, then filter `rn = 1` from the level above (a window
function may not appear in the `WHERE` that defines it).
