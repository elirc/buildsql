WITH months AS (
  SELECT date_trunc('month', created_at) AS month,
         count(*) FILTER (WHERE status = 'paid') AS paid,
         count(*) FILTER (WHERE status = 'cancelled') AS cancelled
  FROM orders
  GROUP BY date_trunc('month', created_at))
SELECT month, paid, cancelled,
       round(100.0 * cancelled / (paid + cancelled), 2) AS cancel_rate,
       lag(round(100.0 * cancelled / (paid + cancelled), 2)) OVER (ORDER BY month) AS prev_rate
FROM months
ORDER BY month;
