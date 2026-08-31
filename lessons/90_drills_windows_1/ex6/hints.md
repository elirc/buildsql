## Hint 1

Two stages: aggregate revenue by month and status, then rank the four statuses inside each month.

## Hint 2

`rank() OVER (PARTITION BY month ORDER BY revenue DESC)` reading from the CTE. Rank the raw `revenue`, and round only in the output column - ranking the rounded value can invent ties that are not there.
