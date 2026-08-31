SELECT o.id, c.name, c.country, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.id <= 50
ORDER BY o.id;
