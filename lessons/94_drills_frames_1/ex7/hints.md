## Hint 1

Three steps: daily totals, a trailing average attached to each day, then keep only the days that beat their own average.

## Hint 2

`avg(revenue) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)` in a CTE - six preceding rows plus the current one is seven days.

## Hint 3

The filter has to be in a query above the window, and it compares the raw `revenue` to the raw `ma7`. Round only in the final select list.
