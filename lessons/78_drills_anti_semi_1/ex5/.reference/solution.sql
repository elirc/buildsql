SELECT c.id, c.name
FROM customers c
JOIN (SELECT DISTINCT customer_id FROM orders) b ON b.customer_id = c.id
LEFT JOIN (SELECT DISTINCT o.customer_id
           FROM orders o
           JOIN order_items oi ON oi.order_id = o.id
           JOIN products p ON p.id = oi.product_id
           WHERE p.category = 'electronics') e ON e.customer_id = c.id
WHERE c.country = 'JP' AND e.customer_id IS NULL
ORDER BY c.id;
