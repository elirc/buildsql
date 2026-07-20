WITH monthly AS (
  SELECT date_trunc('month', created_at) AS month, sum(total) AS revenue
  FROM orders GROUP BY 1)
SELECT month, revenue,
       round(100 * (revenue - lag(revenue) OVER (ORDER BY month))
             / lag(revenue) OVER (ORDER BY month), 1)
FROM monthly ORDER BY month;
