SELECT id, created_at
FROM orders
WHERE customer_id = 4242
ORDER BY created_at DESC
LIMIT 5;
