SELECT o.id, c.name, c.country, o.total
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.id <= 50
ORDER BY o.id;
