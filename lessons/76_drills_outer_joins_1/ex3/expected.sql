SELECT c.id, c.name, o.id AS order_id, o.total
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE c.country = 'ES' AND c.created_at >= '2023-10-01'
ORDER BY c.id, o.id NULLS FIRST;
