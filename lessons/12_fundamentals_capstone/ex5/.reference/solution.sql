SELECT date_trunc('month', created_at) AS month,
       count(*) AS orders,
       sum(total) AS revenue
FROM orders
WHERE status = 'paid'
  AND created_at >= '2023-01-01'
  AND created_at <  '2024-01-01'
GROUP BY 1
ORDER BY 1;
