SELECT id, name, country, created_at
FROM customers
ORDER BY country ASC, created_at DESC, id ASC
OFFSET 100
LIMIT 25;
