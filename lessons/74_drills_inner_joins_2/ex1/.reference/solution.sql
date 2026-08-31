SELECT oi.id AS item_id, oi.order_id, o.status, p.name AS product, oi.quantity
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN products p ON p.id = oi.product_id
WHERE oi.order_id <= 40
ORDER BY oi.order_id, oi.id;
