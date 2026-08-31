SELECT o.id, o.customer_id, o.created_at
FROM orders AS o
WHERE o.status IN ('cancelled')
ORDER BY o.created_at DESC, o.id DESC
LIMIT 10;
