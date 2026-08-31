WITH firsts AS (
  SELECT customer_id, min(created_at) AS first_order
  FROM orders
  GROUP BY customer_id)
SELECT date_trunc('month', o.created_at) AS month,
       count(*) AS orders,
       count(DISTINCT o.customer_id)
         FILTER (WHERE date_trunc('month', o.created_at)
                     = date_trunc('month', f.first_order)) AS new_customers,
       count(DISTINCT o.customer_id)
         FILTER (WHERE date_trunc('month', o.created_at)
                     > date_trunc('month', f.first_order)) AS returning_customers
FROM orders o
JOIN firsts f ON f.customer_id = o.customer_id
GROUP BY date_trunc('month', o.created_at)
ORDER BY month;
