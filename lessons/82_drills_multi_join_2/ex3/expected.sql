WITH c AS (
    SELECT date_trunc('month', created_at) AS month, count(*) AS new_customers
    FROM customers
    WHERE created_at >= '2023-01-01' AND created_at < '2023-12-01'
    GROUP BY 1
), o AS (
    SELECT date_trunc('month', created_at) AS month, count(*) AS orders
    FROM orders
    WHERE created_at >= '2023-01-01' AND created_at < '2023-12-01'
    GROUP BY 1
)
SELECT c.month, c.new_customers, o.orders
FROM c
JOIN o ON o.month = c.month
ORDER BY c.month;
