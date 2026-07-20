## Hint 1
The revenue lives in `order_items`, the filter lives in `orders`, the
grouping key lives in `products` — a three-table join where each table
contributes one thing.

## Hint 2
```sql
SELECT p.category, sum(oi.quantity) AS units,
       sum(oi.quantity * oi.price) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
WHERE o.status IN ('paid', 'shipped')
GROUP BY p.category;
```
