WITH per_customer AS (
  SELECT customer_id, count(*) AS orders, avg(total) AS avg_total
  FROM orders
  GROUP BY customer_id)
SELECT customer_id, orders, round(avg_total, 2) AS avg_total
FROM per_customer
WHERE orders >= 18 AND avg_total > 1200
ORDER BY customer_id;
