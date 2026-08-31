SELECT c.id, c.name, c.country, c.created_at
FROM customers AS c
ORDER BY c.country, c.created_at DESC, c.id
LIMIT 25 OFFSET 100;
