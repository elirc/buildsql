SELECT status,
       round(sum(CASE WHEN created_at < DATE '2023-01-01' THEN total END), 2) AS revenue_2022,
       round(sum(CASE WHEN created_at >= DATE '2023-01-01' THEN total END), 2) AS revenue_2023
FROM orders
GROUP BY 1
ORDER BY 1;
