SELECT oi.id, oi.order_id, o.status, oi.quantity, o.total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE oi.id <= 30
ORDER BY oi.id;
