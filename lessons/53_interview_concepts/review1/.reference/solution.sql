SELECT c.id, c.name
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name
HAVING count(*) FILTER (WHERE o.status = 'cancelled') = 0;
