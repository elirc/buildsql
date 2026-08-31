WITH oct_paid AS (
  SELECT date_trunc('week', created_at) AS week, total
  FROM orders
  WHERE status = 'paid'
    AND created_at >= '2023-10-01' AND created_at < '2023-11-01')
SELECT week, count(*) AS orders, sum(total) AS revenue
FROM oct_paid
GROUP BY week
ORDER BY week;
