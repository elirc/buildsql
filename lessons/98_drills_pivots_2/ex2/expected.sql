SELECT status,
       count(*) AS orders,
       count(*) FILTER (WHERE extract(dow FROM created_at) IN (0, 6)) AS weekend,
       count(*) FILTER (WHERE extract(dow FROM created_at) NOT IN (0, 6)) AS weekday
FROM orders
GROUP BY status
ORDER BY status;
