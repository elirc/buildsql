SELECT c.id, c.name,
       count(o.id) FILTER (WHERE o.status = 'paid') AS paid,
       count(o.id) FILTER (WHERE o.status = 'cancelled') AS cancelled
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE c.country = 'IN' AND c.created_at >= DATE '2023-08-01'
GROUP BY c.id, c.name
ORDER BY c.id;
