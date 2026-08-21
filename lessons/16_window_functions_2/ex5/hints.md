## Hint 1
Exercise 2's CTE unchanged; swap `lag` for `lead` and drop the delta
column.

## Hint 2
`lead(revenue) OVER (ORDER BY month) AS next_month`
