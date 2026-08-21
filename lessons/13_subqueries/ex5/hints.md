## Hint 1
A parenthesised `SELECT count(*) ...` can sit in the SELECT list like
any other expression, and it may refer to `c.id` from the outer row.

## Hint 2
`SELECT c.id, c.name, (SELECT count(*) FROM orders o WHERE o.customer_id = c.id) AS orders FROM customers c WHERE c.id <= 20;`
