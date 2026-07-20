## Hint 1
Two hops: order_items rows for order 123, then each item's product. You
can start FROM orders and join twice, or start FROM order_items — both
pass; the expected rows are the same.

## Hint 2
```sql
SELECT p.name, oi.quantity, oi.price
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
WHERE o.id = 123;
```

Trace each ON clause: which column of which table matches which?
