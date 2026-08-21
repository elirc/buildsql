## Hint 1
The signup-date filter is about `customers`; the "never ordered" part
is an anti-join to `orders`. Both conditions are on the left table's
population, so a LEFT JOIN with `o.id IS NULL` works.

## Hint 2
`FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE c.created_at >= '2023-07-01' AND c.created_at < '2023-10-01' AND o.id IS NULL`
