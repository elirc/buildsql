## Hint 1
Inner query: which order_ids contain a >490 product? That needs
order_items joined to products. Outer query: orders whose id is IN that
list.

## Hint 2
```sql
SELECT id, total
FROM orders
WHERE id IN (SELECT oi.order_id
             FROM order_items oi
             JOIN products p ON p.id = oi.product_id
             WHERE p.price > 490);
```
