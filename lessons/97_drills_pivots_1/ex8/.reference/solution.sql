WITH months AS (
  SELECT date_trunc('month', created_at) AS month,
         count(CASE WHEN status = 'paid' THEN 1 END) AS paid,
         count(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled
  FROM orders
  GROUP BY 1),
rated AS (
  SELECT month, paid, cancelled,
         round(100.0 * cancelled / (paid + cancelled), 2) AS cancel_rate
  FROM months)
SELECT month, paid, cancelled, cancel_rate,
       lag(cancel_rate) OVER (ORDER BY month) AS prev_rate
FROM rated
ORDER BY month;
