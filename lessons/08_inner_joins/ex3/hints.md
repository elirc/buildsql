## Hint 1
Join items to products (on product id), group by the product's category,
sum the per-row revenue expression. Orders themselves aren't needed —
nothing filters on them.

## Hint 2
```sql
SELECT p.category, sum(oi.quantity * oi.price)
FROM order_items oi
JOIN products p ON p.id = oi.product_id
GROUP BY p.category;
```
