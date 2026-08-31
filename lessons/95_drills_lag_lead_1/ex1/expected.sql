WITH daily AS (
  SELECT date_trunc('day', created_at) AS day, count(*) AS orders
  FROM orders
  WHERE status = 'paid'
    AND created_at >= '2023-09-01' AND created_at < '2023-10-01'
  GROUP BY 1)
SELECT day, orders, lag(orders) OVER (ORDER BY day) AS prev_day
FROM daily
ORDER BY day;
