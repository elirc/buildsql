SELECT c.id, c.name, count(*) AS cancelled
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE c.country = 'AU' AND o.status = 'cancelled'
GROUP BY c.id, c.name
ORDER BY c.id;
