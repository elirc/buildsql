WITH ranked AS (
  SELECT date_trunc('month', created_at) AS month, id, created_at,
         row_number() OVER (PARTITION BY date_trunc('month', created_at)
                            ORDER BY created_at ASC, id ASC) AS rn
  FROM orders
  WHERE created_at >= '2023-01-01' AND created_at < '2024-01-01')
SELECT month, id AS order_id, created_at
FROM ranked
WHERE rn = 1
ORDER BY month;
