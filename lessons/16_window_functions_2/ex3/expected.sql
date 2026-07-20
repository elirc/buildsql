WITH daily AS (
  SELECT date_trunc('day', created_at) AS day, sum(total) AS revenue
  FROM orders
  WHERE created_at >= '2023-10-01' AND created_at < '2023-11-01'
  GROUP BY 1)
SELECT day, revenue,
       round(avg(revenue) OVER (ORDER BY day
             ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2)
FROM daily ORDER BY day;
