SELECT DISTINCT p.id, p.name, r.id AS review_id, r.created_at
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN reviews r ON r.product_id = p.id
WHERE c.id = 17 AND r.rating = 1
ORDER BY p.id, r.id;
