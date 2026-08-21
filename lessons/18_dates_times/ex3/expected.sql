SELECT extract(month FROM created_at)::int AS month_no, count(*) AS orders
FROM orders
GROUP BY 1
ORDER BY 1;
