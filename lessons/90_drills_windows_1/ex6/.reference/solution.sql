WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month, status, sum(total) AS revenue
    FROM orders
    GROUP BY 1, 2
)
SELECT m.month, m.status, round(m.revenue, 2) AS revenue,
       (SELECT count(*) + 1 FROM monthly n
        WHERE n.month = m.month AND n.revenue > m.revenue) AS rnk
FROM monthly m
ORDER BY m.month, rnk, m.status;
