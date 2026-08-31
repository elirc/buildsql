SELECT oi.order_id, p.name, oi.quantity
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE o.customer_id = 88
ORDER BY 1, 2, 3;
