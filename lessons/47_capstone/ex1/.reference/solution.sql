SELECT date_trunc('day', o.created_at) AS day,
       count(*) AS orders, sum(o.total) AS revenue
FROM orders o
WHERE o.status = 'paid'
  AND o.created_at >= '2023-10-01'
  AND o.created_at <  '2023-10-08'
GROUP BY 1;
