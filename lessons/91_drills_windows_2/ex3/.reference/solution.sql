WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month,
           count(*) AS orders,
           sum(total) AS revenue
    FROM orders
    GROUP BY 1
), total AS (
    SELECT sum(revenue) AS revenue FROM monthly
)
SELECT m.month, m.orders,
       round(m.revenue, 2) AS revenue,
       round(100 * m.revenue / t.revenue, 2) AS pct_of_year
FROM monthly m
CROSS JOIN total t
ORDER BY m.month;
