SELECT id, created_at,
       extract(epoch FROM created_at)::bigint AS epoch_seconds
FROM orders
WHERE id <= 15
ORDER BY id;
