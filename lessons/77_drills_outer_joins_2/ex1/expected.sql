SELECT c.id, c.name, count(o.id) AS cancelled
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled'
WHERE c.country = 'AU'
GROUP BY c.id, c.name
ORDER BY c.id;
