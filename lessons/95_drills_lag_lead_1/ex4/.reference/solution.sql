WITH seq AS (
  SELECT id, created_at,
         lag(created_at) OVER (ORDER BY created_at, id) AS prev_at
  FROM orders
  WHERE customer_id = 42)
SELECT id, created_at, created_at - prev_at AS since_prev
FROM seq
ORDER BY created_at, id;
