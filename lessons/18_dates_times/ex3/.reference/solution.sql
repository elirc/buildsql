SELECT extract(month FROM created_at)::int AS month_no,
       count(*) AS orders
FROM orders
GROUP BY month_no
ORDER BY month_no;
