SELECT created_at::date AS day,
       count(*) AS orders,
       round(sum(total), 2) AS revenue
FROM orders
WHERE created_at >= DATE '2023-03-13'
  AND created_at < DATE '2023-03-20'
GROUP BY created_at::date
ORDER BY day;
