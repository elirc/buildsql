SELECT id, name, created_at
FROM customers
ORDER BY created_at DESC, id DESC
LIMIT 10 OFFSET 20;
