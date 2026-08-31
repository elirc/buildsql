SELECT oi.id, oi.order_id, o.status, oi.quantity, o.total
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE oi.id <= 30
ORDER BY oi.id;
