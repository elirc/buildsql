SELECT oi.id AS item_id, o.id AS order_id, o.status, p.name AS product, oi.quantity
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.id <= 40
ORDER BY o.id, oi.id;
