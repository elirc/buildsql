SELECT id, name, country, created_at
FROM customers
ORDER BY country DESC, created_at ASC, id ASC
LIMIT 30;
