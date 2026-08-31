## Hint 1
A subquery can also appear in the `SELECT` list, where it produces one value per output row. Each of these two needs to know which customer the current row is about.

## Hint 2
`(SELECT count(*) FROM orders o WHERE o.customer_id = c.id)` - the reference to `c.id` from inside the subquery is what makes it correlated, and it is re-evaluated for every customer. A customer with no orders gets `0` from the count and NULL from the `max`, which is exactly what the prompt asks for.
