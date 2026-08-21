SELECT date_trunc('week', created_at) AS week,
       count(*) AS orders,
       sum(total) AS revenue
FROM orders
WHERE created_at >= '2023-10-01'
  AND created_at <  '2023-11-01'
GROUP BY week
ORDER BY week;
