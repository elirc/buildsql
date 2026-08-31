SELECT p.id, p.name
FROM products p
LEFT JOIN (SELECT DISTINCT oi.product_id
           FROM order_items oi
           JOIN orders o ON o.id = oi.order_id
           WHERE oi.quantity = 5
             AND o.created_at >= DATE '2023-11-01') x ON x.product_id = p.id
WHERE p.category = 'garden' AND p.price > 480
  AND x.product_id IS NULL
ORDER BY p.id;
