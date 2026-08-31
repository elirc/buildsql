WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month, count(*) AS orders
    FROM orders
    GROUP BY 1
)
SELECT month, orders, lag(orders) OVER (ORDER BY month) AS prev_orders
FROM monthly
ORDER BY month;
