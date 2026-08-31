SELECT count(*) AS orders,
       sum(total) AS revenue,
       round(avg(total), 2) AS aov
FROM orders
WHERE status = 'paid'
  AND created_at >= '2023-10-01' AND created_at < '2023-11-01';
