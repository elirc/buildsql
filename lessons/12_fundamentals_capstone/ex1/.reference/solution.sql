SELECT status, count(*) AS orders, sum(total) AS revenue
FROM orders
WHERE created_at >= '2023-07-01'
  AND created_at < '2023-10-01'
GROUP BY status
ORDER BY status;
