SELECT status,
       round(sum(total) FILTER (WHERE created_at < DATE '2023-01-01'), 2) AS revenue_2022,
       round(sum(total) FILTER (WHERE created_at >= DATE '2023-01-01'), 2) AS revenue_2023
FROM orders
GROUP BY status
ORDER BY status;
