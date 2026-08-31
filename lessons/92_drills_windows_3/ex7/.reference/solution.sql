WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month, sum(total) AS revenue
    FROM orders
    GROUP BY 1
)
SELECT m.month,
       round(m.revenue, 2) AS revenue,
       round((SELECT sum(n.revenue) FROM monthly n WHERE n.month <= m.month), 2)
         AS running_by_month,
       round((SELECT sum(n.revenue) FROM monthly n
              WHERE n.revenue > m.revenue
                 OR (n.revenue = m.revenue AND n.month <= m.month)), 2)
         AS running_by_size
FROM monthly m
ORDER BY m.month;
