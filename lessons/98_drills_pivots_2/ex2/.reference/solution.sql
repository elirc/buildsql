SELECT status,
       count(*) AS orders,
       count(CASE WHEN extract(dow FROM created_at) IN (0, 6) THEN 1 END) AS weekend,
       count(*) - count(CASE WHEN extract(dow FROM created_at) IN (0, 6) THEN 1 END) AS weekday
FROM orders
GROUP BY 1
ORDER BY 1;
