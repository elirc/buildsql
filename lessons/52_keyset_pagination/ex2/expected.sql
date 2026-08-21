SELECT id, category, name
FROM products
ORDER BY category, id
OFFSET 20
LIMIT 20;
