## Hint 1
Write the aggregation first and run it alone. Then wrap it in
parentheses, give it an alias, and put a WHERE around the outside.

## Hint 2
`SELECT customer_id, revenue FROM (SELECT customer_id, sum(total) AS revenue FROM orders WHERE status IN ('paid','shipped') GROUP BY customer_id) AS per_customer WHERE revenue > 20000;`
