## Hint 1

Three stages: pivot the orders into monthly `paid` and `cancelled` counts,
turn those two numbers into a rate, then fetch the previous month's rate.
Each stage wants its own query level.

## Hint 2

Do the pivot in a CTE. In the next level the months are ordinary rows, so
`lag(...) OVER (ORDER BY month)` can see them. A window function may not be
nested inside an aggregate, which is why the pivot cannot be skipped.

## Hint 3

Naming the rate in its own CTE means `lag(cancel_rate) OVER (ORDER BY month)`
is all the last level needs, and the first month's `prev_rate` is NULL
because there is no earlier row - leave it NULL.
