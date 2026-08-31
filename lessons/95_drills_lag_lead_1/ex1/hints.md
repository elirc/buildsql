## Hint 1

Two steps: first collapse the month into one row per day (a GROUP BY in a CTE), then attach each row's predecessor with a window function. LAG cannot run until the daily rows exist.

## Hint 2

`lag(orders) OVER (ORDER BY day)` on the CTE's output. The first day of the month has no predecessor, so its `prev_day` is NULL - leave it that way.
