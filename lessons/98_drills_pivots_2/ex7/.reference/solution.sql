WITH firsts AS (
  SELECT customer_id, date_trunc('month', min(created_at)) AS first_month
  FROM orders
  GROUP BY customer_id),
tagged AS (
  SELECT o.customer_id,
         date_trunc('month', o.created_at) AS month,
         f.first_month
  FROM orders o
  JOIN firsts f ON f.customer_id = o.customer_id)
SELECT month,
       count(*) AS orders,
       count(DISTINCT CASE WHEN month = first_month THEN customer_id END) AS new_customers,
       count(DISTINCT CASE WHEN month > first_month THEN customer_id END) AS returning_customers
FROM tagged
GROUP BY month
ORDER BY month;
