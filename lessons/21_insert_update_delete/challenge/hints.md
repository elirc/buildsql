## Hint 1
Statement 1: INSERT INTO orders (...) SELECT with the new id, `'pending'`,
and timestamp literal as constant expressions alongside the copied
columns. Statement 2: INSERT INTO order_items (...) SELECT with
`id + 1000000` and the literal 600001.

## Hint 2
```sql
INSERT INTO orders (id, customer_id, status, total, created_at)
SELECT 600001, customer_id, 'pending', total, '2023-11-15'
FROM orders WHERE id = 123;

INSERT INTO order_items (id, order_id, product_id, quantity, price)
SELECT id + 1000000, 600001, product_id, quantity, price
FROM order_items WHERE order_id = 123;
```
