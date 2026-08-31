SELECT oi.id, p.name AS product, c.name AS customer, c.country, oi.quantity
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE p.category = 'garden' AND p.price > 495
ORDER BY oi.id;
