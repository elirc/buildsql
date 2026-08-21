## Hint 1
Three grouping sets, listed explicitly: one on the truncated month, one
on status, and the empty one for the grand total.

## Hint 2
`GROUP BY GROUPING SETS ((date_trunc('month', created_at)), (status), ())`
