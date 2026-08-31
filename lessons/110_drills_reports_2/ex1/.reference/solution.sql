WITH grouped AS (
  SELECT status, count(*) AS orders, sum(total) AS revenue
  FROM orders
  GROUP BY status)
SELECT status, orders, round(revenue / orders, 2) AS avg_total
FROM grouped
ORDER BY status;
