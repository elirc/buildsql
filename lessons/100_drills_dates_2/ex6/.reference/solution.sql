SELECT date_trunc('day', created_at)::date AS day,
       count(*) AS orders,
       round(sum(total), 2) AS revenue
FROM orders
WHERE created_at >= DATE '2023-03-13'
  AND created_at < DATE '2023-03-13' + interval '7 days'
GROUP BY 1
ORDER BY 1;
