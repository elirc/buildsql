SELECT id, customer_id, created_at
FROM orders
WHERE status = 'cancelled'
ORDER BY created_at DESC, id DESC
LIMIT 10;
