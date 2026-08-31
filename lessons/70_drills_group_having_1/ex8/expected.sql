SELECT customer_id,
       count(*) AS orders,
       count(DISTINCT date_trunc('month', created_at)) AS active_months
FROM orders
GROUP BY customer_id
HAVING count(DISTINCT date_trunc('month', created_at)) >= 11
ORDER BY customer_id;
