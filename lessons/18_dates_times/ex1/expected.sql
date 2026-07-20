SELECT extract(dow FROM created_at)::int, count(*)
FROM orders GROUP BY 1 ORDER BY 1;
