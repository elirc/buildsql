## Hint 1

A local minimum needs both neighbours: yesterday's revenue via LAG and tomorrow's via LEAD, side by side on the same row. Then keep the rows that are below both.

## Hint 2

You cannot filter on a window function in the query that computes it - WHERE runs before windows exist. Compute `prev` and `lead` in a CTE over the daily CTE, and put `revenue < prev AND revenue < next` in the outer query.

## Hint 3

July 1st has a NULL `prev` and July 31st a NULL `next`; `revenue < NULL` is NULL, not true, so both edge days drop out of the result on their own. Decide whether that is the behaviour you want before calling it an accident - here it is exactly right, because an edge day has only one neighbour to compare against.
