SELECT o.id AS order_id, p.name AS product, oi.quantity
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.customer_id = 88
ORDER BY o.id, p.name, oi.quantity;
