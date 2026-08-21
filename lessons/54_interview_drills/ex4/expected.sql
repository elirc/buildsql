WITH marked AS (
  SELECT customer_id, created_at,
         min(created_at) OVER (PARTITION BY customer_id) AS first_at
  FROM orders),
per_customer AS (
  SELECT customer_id, date_trunc('month', first_at) AS cohort_month,
         bool_or(created_at > first_at
                 AND created_at <= first_at + INTERVAL '30 days') AS repeated
  FROM marked
  GROUP BY customer_id, 2)
SELECT cohort_month, count(*) AS cohort_size,
       count(*) FILTER (WHERE repeated) AS repeat_30d
FROM per_customer
GROUP BY 1
ORDER BY 1;
