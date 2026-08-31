WITH oct_paid AS (
  SELECT total
  FROM orders
  WHERE status = 'paid'
    AND created_at >= '2023-10-01' AND created_at < '2023-11-01')
SELECT count(*) AS orders,
       sum(total) AS revenue,
       round(sum(total) / count(*), 2) AS aov
FROM oct_paid;
