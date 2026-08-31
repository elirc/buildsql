WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month, count(*) AS orders
    FROM orders
    GROUP BY 1
)
SELECT m.month, m.orders,
       (SELECT sum(n.orders) FROM monthly n
        WHERE n.month BETWEEN m.month - INTERVAL '2 months'
                          AND m.month) AS trailing3
FROM monthly m
ORDER BY m.month;
