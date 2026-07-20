SELECT id
FROM orders
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 20;
