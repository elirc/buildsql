SELECT oi.id, p.name AS product, o.status, oi.quantity
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE p.category = 'electronics' AND p.price > 490
ORDER BY oi.id;
