SELECT to_char(created_at, 'YYYY-MM') AS month,
       count(*) AS orders
FROM orders
GROUP BY to_char(created_at, 'YYYY-MM')
ORDER BY month;
