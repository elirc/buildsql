SELECT o.id, o.status, o.total
FROM orders o
WHERE o.created_at >= '2023-11-01'
  AND EXISTS (SELECT 1 FROM order_items oi
              JOIN products p ON p.id = oi.product_id
              WHERE oi.order_id = o.id AND p.category = 'books')
  AND EXISTS (SELECT 1 FROM order_items oi
              JOIN products p ON p.id = oi.product_id
              WHERE oi.order_id = o.id AND p.category = 'electronics')
ORDER BY o.id;
