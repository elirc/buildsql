## Hint 1
The subquery selects one column from `order_items`, narrowed to the first
1,000 orders. That column is declared NOT NULL, so no NULL can reach the
`NOT IN` list and poison it.

## Hint 2
`SELECT id, name FROM products WHERE id NOT IN (SELECT product_id FROM order_items WHERE order_id <= 1000);`
