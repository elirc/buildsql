SELECT date_trunc('month', created_at) AS month,
       count(*) AS orders,
       count(DISTINCT customer_id) AS buyers,
       round(sum(total) / count(*), 2) AS aov,
       round(sum(total) / count(DISTINCT customer_id), 2) AS arpu
FROM orders
WHERE status <> 'cancelled'
  AND created_at >= '2023-01-01' AND created_at < '2024-01-01'
GROUP BY date_trunc('month', created_at)
ORDER BY month;
