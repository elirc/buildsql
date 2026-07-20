## Hint 1
Start from lesson 12 ex3's three-table join. Replace the single revenue
column with four copies of the same sum, each wearing a different
`FILTER (WHERE o.status = '...')`.

## Hint 2
```sql
SELECT p.category,
       sum(oi.quantity * oi.price) FILTER (WHERE o.status = 'pending')   AS pending,
       sum(oi.quantity * oi.price) FILTER (WHERE o.status = 'paid')      AS paid,
       ... two more ...
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
GROUP BY p.category;
```
