SELECT c.id, c.name,
       count(DISTINCT p.id) AS paid,
       count(DISTINCT x.id) AS cancelled
FROM customers c
LEFT JOIN orders p ON p.customer_id = c.id AND p.status = 'paid'
LEFT JOIN orders x ON x.customer_id = c.id AND x.status = 'cancelled'
WHERE c.country = 'IN' AND c.created_at >= '2023-08-01'
GROUP BY c.id, c.name
ORDER BY c.id;
