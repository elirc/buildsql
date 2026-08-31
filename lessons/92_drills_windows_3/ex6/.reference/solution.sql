WITH weekly AS (
    SELECT date_trunc('week', created_at) AS week,
           count(*) AS orders,
           sum(total) AS revenue
    FROM orders
    GROUP BY 1
)
SELECT w.week, w.orders,
       round(w.revenue, 2) AS revenue,
       round((SELECT sum(n.revenue) FROM weekly n WHERE n.week <= w.week), 2)
         AS running_revenue
FROM weekly w
ORDER BY w.week;
