SELECT created_at::date AS day,
       trim(to_char(created_at, 'Day')) AS dow_name,
       count(*) AS orders
FROM orders
WHERE created_at >= DATE '2023-06-01'
  AND created_at < DATE '2023-07-01'
GROUP BY created_at::date, trim(to_char(created_at, 'Day'))
ORDER BY day;
