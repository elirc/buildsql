SELECT c.id, c.name, c.country
FROM customers AS c
ORDER BY c.name, c.id
LIMIT 20 OFFSET 40;
