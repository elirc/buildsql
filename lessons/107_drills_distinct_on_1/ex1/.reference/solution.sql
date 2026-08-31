WITH ranked AS (
  SELECT status, id, created_at,
         row_number() OVER (PARTITION BY status
                            ORDER BY created_at ASC, id ASC) AS rn
  FROM orders)
SELECT status, id AS order_id, created_at
FROM ranked
WHERE rn = 1
ORDER BY status;
