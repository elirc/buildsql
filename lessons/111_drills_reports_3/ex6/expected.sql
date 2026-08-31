WITH gaps AS (
  SELECT created_at::date
         - (lag(created_at) OVER (PARTITION BY customer_id
                                  ORDER BY created_at, id))::date AS gap_days
  FROM orders)
SELECT round(avg(gap_days), 1) AS avg_gap_days
FROM gaps
WHERE gap_days IS NOT NULL;
