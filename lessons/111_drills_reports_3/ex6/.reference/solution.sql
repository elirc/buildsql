WITH per_c AS (
  SELECT customer_id,
         count(*) AS n,
         max(created_at)::date AS last_day,
         min(created_at)::date AS first_day
  FROM orders
  GROUP BY customer_id
  HAVING count(*) >= 2)
SELECT round(sum(last_day - first_day)::numeric / sum(n - 1), 1) AS avg_gap_days
FROM per_c;
