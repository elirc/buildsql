WITH daily AS (
  SELECT date_trunc('day', created_at) AS day, sum(total) AS revenue
  FROM orders
  WHERE created_at >= '2023-07-01' AND created_at < '2023-08-01'
  GROUP BY 1),
flagged AS (
  SELECT day, revenue,
         lag(revenue)  OVER (ORDER BY day) AS prev,
         lead(revenue) OVER (ORDER BY day) AS next
  FROM daily)
SELECT day, revenue
FROM flagged
WHERE revenue < prev AND revenue < next
ORDER BY day;
