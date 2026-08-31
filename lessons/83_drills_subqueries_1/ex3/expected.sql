SELECT p.id, p.name
FROM products p
WHERE p.category = 'garden'
  AND p.id IN (SELECT oi.product_id
               FROM order_items oi
               JOIN orders o ON o.id = oi.order_id
               WHERE oi.quantity = 5
                 AND o.created_at >= '2023-11-01')
ORDER BY p.id;
