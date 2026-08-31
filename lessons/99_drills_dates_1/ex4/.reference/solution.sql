SELECT date_trunc('day', created_at)::date AS day,
       to_char(created_at, 'FMDay') AS dow_name,
       count(*) AS orders
FROM orders
WHERE created_at >= DATE '2023-06-01'
  AND created_at < DATE '2023-07-01'
GROUP BY 1, 2
ORDER BY 1;
