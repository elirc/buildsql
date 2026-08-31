WITH per_customer AS (
  SELECT customer_id,
         count(*) AS orders,
         count(DISTINCT date_trunc('month', created_at)) AS active_months
  FROM orders
  GROUP BY customer_id)
SELECT customer_id, orders, active_months
FROM per_customer
WHERE active_months >= 11
ORDER BY customer_id;
