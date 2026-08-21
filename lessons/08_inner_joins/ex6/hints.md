## Hint 1
Join on `c.id = o.customer_id`, group by `c.country`, sum `o.total`.

## Hint 2
`SELECT c.country, sum(o.total) FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.country;`
