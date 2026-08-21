## Hint 1
CTE: join orders to order_items, `GROUP BY o.id` and the month, count
the lines. Outer: group that by month and average the counts.

## Hint 2
`round(avg(items), 3) AS avg_items` over the per-order CTE, grouped and
ordered by `month`.
