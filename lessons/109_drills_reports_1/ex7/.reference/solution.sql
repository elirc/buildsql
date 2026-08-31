WITH monthly AS (
  SELECT date_trunc('month', created_at) AS month, count(*) AS orders
  FROM orders
  WHERE status = 'paid'
    AND created_at >= '2023-01-01' AND created_at < '2024-01-01'
  GROUP BY 1),
lagged AS (
  SELECT month, orders,
         lag(orders) OVER (ORDER BY month) AS prev
  FROM monthly)
SELECT month,
       orders,
       round(100.0 * (orders - prev) / prev, 1) AS change_pct,
       CASE WHEN prev IS NULL THEN NULL
            WHEN orders > prev THEN 'up'
            WHEN orders < prev THEN 'down'
            ELSE 'flat' END AS trend
FROM lagged
ORDER BY month;
