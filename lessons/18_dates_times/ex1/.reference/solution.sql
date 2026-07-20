SELECT extract(dow FROM created_at)::int AS dow,
       count(*) AS orders
FROM orders
GROUP BY 1
ORDER BY dow;
