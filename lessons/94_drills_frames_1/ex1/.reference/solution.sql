WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month, sum(total) AS revenue
    FROM orders
    GROUP BY 1
)
SELECT m.month,
       round(m.revenue, 2) AS revenue,
       round((SELECT avg(n.revenue) FROM monthly n
              WHERE n.month BETWEEN m.month - INTERVAL '1 month'
                                AND m.month + INTERVAL '1 month'), 2) AS ma3
FROM monthly m
ORDER BY m.month;
