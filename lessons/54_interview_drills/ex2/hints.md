## Hint 1
Aggregate first, window second. Once you have one row per month, "the
previous month" is just the row above -- which is exactly what a window
function can see and a `GROUP BY` cannot.

## Hint 2
A CTE producing `date_trunc('month', created_at) AS month, sum(total) AS
revenue` for non-cancelled orders, then
`revenue - lag(revenue) OVER (ORDER BY month)` in the outer query.

## Hint 3
The first month has no previous row, so `lag` returns NULL and the
subtraction returns NULL -- that is the answer the prompt asks for, so do
*not* wrap it in `coalesce(..., 0)`. A zero there would claim the first
month grew by nothing, which is a different and false statement.
