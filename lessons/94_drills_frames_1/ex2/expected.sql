WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month, count(*) AS orders
    FROM orders
    GROUP BY 1
)
SELECT month, orders,
       sum(orders) OVER (ORDER BY month
                         ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS trailing3
FROM monthly
ORDER BY month;
