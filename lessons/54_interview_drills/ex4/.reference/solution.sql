WITH firsts AS (
  SELECT customer_id, min(created_at) AS first_at
  FROM orders
  GROUP BY customer_id),
repeats AS (
  SELECT f.customer_id, date_trunc('month', f.first_at) AS cohort_month,
         count(o.id) AS later_orders
  FROM firsts f
  LEFT JOIN orders o ON o.customer_id = f.customer_id
                    AND o.created_at > f.first_at
                    AND o.created_at <= f.first_at + INTERVAL '30 days'
  GROUP BY f.customer_id, 2)
SELECT cohort_month, count(*) AS cohort_size,
       count(*) FILTER (WHERE later_orders > 0) AS repeat_30d
FROM repeats
GROUP BY 1
ORDER BY 1;
