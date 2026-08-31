SELECT date_trunc('quarter', created_at) AS qtr,
       date_trunc('month', created_at) AS month,
       sum(total) AS revenue
FROM orders
WHERE created_at >= '2023-01-01' AND created_at < '2023-07-01'
GROUP BY GROUPING SETS
  ((date_trunc('quarter', created_at), date_trunc('month', created_at)),
   (date_trunc('quarter', created_at)),
   ())
ORDER BY qtr, month;
