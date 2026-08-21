## Hint 1
The subquery is correlated: it mentions `c.id` from the outer row. What
you SELECT inside is irrelevant - `SELECT 1` is the convention.

## Hint 2
`WHERE c.country = 'FR' AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')`
