WITH monthly AS (
  SELECT date_trunc('month', created_at) AS month, count(*) AS orders
  FROM orders
  WHERE status = 'paid'
    AND created_at >= '2023-01-01' AND created_at < '2024-01-01'
  GROUP BY date_trunc('month', created_at))
SELECT month,
       orders,
       round(100.0 * (orders - lag(orders) OVER (ORDER BY month))
             / lag(orders) OVER (ORDER BY month), 1) AS change_pct,
       CASE WHEN lag(orders) OVER (ORDER BY month) IS NULL THEN NULL
            WHEN orders > lag(orders) OVER (ORDER BY month) THEN 'up'
            WHEN orders < lag(orders) OVER (ORDER BY month) THEN 'down'
            ELSE 'flat' END AS trend
FROM monthly
ORDER BY month;
