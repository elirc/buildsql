SELECT c.id, c.name, count(DISTINCT p.category) AS categories
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.created_at >= '2023-11-01'
GROUP BY c.id, c.name
HAVING count(DISTINCT p.category) >= 3
ORDER BY categories DESC, c.id;
