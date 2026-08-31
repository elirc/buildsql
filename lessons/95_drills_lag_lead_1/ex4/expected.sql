SELECT id, created_at,
       created_at - lag(created_at) OVER (ORDER BY created_at, id) AS since_prev
FROM orders
WHERE customer_id = 42
ORDER BY created_at, id;
