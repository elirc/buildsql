SELECT month,
       count(*) FILTER (WHERE src = 'c') AS new_customers,
       count(*) FILTER (WHERE src = 'o') AS orders
FROM (
    SELECT date_trunc('month', created_at) AS month, 'c' AS src
    FROM customers
    WHERE created_at >= DATE '2023-01-01' AND created_at < DATE '2023-12-01'
    UNION ALL
    SELECT date_trunc('month', created_at), 'o'
    FROM orders
    WHERE created_at >= DATE '2023-01-01' AND created_at < DATE '2023-12-01'
) t
GROUP BY month
ORDER BY month;
