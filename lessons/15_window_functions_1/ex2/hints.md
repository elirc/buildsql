## Hint 1
`avg(price)` — but OVER a partition, not a GROUP BY. Round the whole
window expression.

## Hint 2
`round(avg(price) OVER (PARTITION BY category), 2) AS category_avg` —
the other three columns come along untouched.
