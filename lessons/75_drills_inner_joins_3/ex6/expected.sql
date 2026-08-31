SELECT DISTINCT o.id, o.status, o.total
FROM orders o
JOIN order_items b ON b.order_id = o.id
JOIN products pb ON pb.id = b.product_id
JOIN order_items e ON e.order_id = o.id
JOIN products pe ON pe.id = e.product_id
WHERE o.created_at >= '2023-11-01'
  AND pb.category = 'books'
  AND pe.category = 'electronics'
ORDER BY o.id;
