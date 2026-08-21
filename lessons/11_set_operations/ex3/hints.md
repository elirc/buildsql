## Hint 1
Two complete SELECT statements, one column each, with `INTERSECT`
between them. The column names need not match - the first query names
the output.

## Hint 2
`SELECT id FROM customers WHERE country = 'US' INTERSECT SELECT customer_id FROM orders WHERE total > 1900;`
