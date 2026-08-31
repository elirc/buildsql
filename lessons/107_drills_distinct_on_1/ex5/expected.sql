SELECT DISTINCT ON (date_trunc('month', created_at))
       date_trunc('month', created_at) AS month,
       id AS order_id, created_at
FROM orders
WHERE created_at >= '2023-01-01' AND created_at < '2024-01-01'
ORDER BY date_trunc('month', created_at), created_at ASC, id ASC;
