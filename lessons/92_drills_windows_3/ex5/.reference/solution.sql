WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month, sum(total) AS revenue
    FROM orders
    GROUP BY 1
), total AS (
    SELECT sum(revenue) AS revenue FROM monthly
)
SELECT m.month,
       round(m.revenue, 2) AS revenue,
       round((SELECT sum(n.revenue) FROM monthly n WHERE n.month <= m.month), 2)
         AS running_revenue,
       round(100 * (SELECT sum(n.revenue) FROM monthly n WHERE n.month <= m.month)
             / t.revenue, 2) AS running_pct
FROM monthly m
CROSS JOIN total t
ORDER BY m.month;
