SELECT id, name, country
FROM customers
ORDER BY name ASC, id ASC
OFFSET 40
LIMIT 20;
