## Hint 1
`UPDATE orders o SET ... FROM customers c WHERE c.id = o.customer_id
AND ...` - the join condition and both filters all live in the WHERE.

## Hint 2
`UPDATE orders o SET status = 'cancelled' FROM customers c WHERE c.id = o.customer_id AND c.country = 'JP' AND o.status = 'pending';`
