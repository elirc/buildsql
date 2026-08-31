WITH m AS (
  SELECT date_trunc('month', created_at) AS month, customer_id, total
  FROM orders
  WHERE status <> 'cancelled'
    AND created_at >= '2023-01-01' AND created_at < '2024-01-01')
SELECT month,
       count(*) AS orders,
       count(DISTINCT customer_id) AS buyers,
       round(avg(total), 2) AS aov,
       round(sum(total) / count(DISTINCT customer_id), 2) AS arpu
FROM m
GROUP BY month
ORDER BY month;
