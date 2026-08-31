WITH daily AS (
  SELECT date_trunc('month', created_at) AS month,
         date_trunc('day', created_at) AS day,
         sum(total) AS revenue
  FROM orders
  GROUP BY 1, 2),
ranked AS (
  SELECT month, day, revenue,
         row_number() OVER (PARTITION BY month
                            ORDER BY revenue DESC, day ASC) AS rn
  FROM daily)
SELECT month, day, revenue
FROM ranked
WHERE rn = 1
ORDER BY month;
