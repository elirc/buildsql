SELECT o.id, o.status, o.total
FROM orders o
WHERE o.created_at >= '2023-11-01'
  AND EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id)
  AND NOT EXISTS (SELECT 1 FROM order_items oi
                  WHERE oi.order_id = o.id AND oi.quantity <> 5)
ORDER BY o.id;
