SELECT id, name, created_at FROM customers
ORDER BY created_at DESC, id DESC OFFSET 20 LIMIT 10;
