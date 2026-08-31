SELECT c.id, c.name, c.country, c.created_at
FROM customers AS c
ORDER BY c.country DESC, c.created_at, c.id
LIMIT 30;
