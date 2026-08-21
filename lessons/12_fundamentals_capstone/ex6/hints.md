## Hint 1
Three tables, two filters on `orders`, group by the product, sum the
line quantities, then order and limit.

## Hint 2
`GROUP BY p.id` is enough - `p.id` is the primary key, so PostgreSQL
lets you select `p.name` and `p.category` ungrouped. Then
`ORDER BY units DESC, p.id ASC LIMIT 5`.
