## Hint 1
The CTE groups by two keys this time. The window adds
`PARTITION BY status` to exercise 1's running total.

## Hint 2
`sum(revenue) OVER (PARTITION BY status ORDER BY day) AS running`, then
`ORDER BY status, day` on the outside.
