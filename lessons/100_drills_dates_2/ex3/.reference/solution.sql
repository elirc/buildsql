SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
       count(*) AS orders
FROM orders
GROUP BY date_trunc('month', created_at)
ORDER BY 1;
