WITH weekly AS (
    SELECT date_trunc('week', created_at) AS week,
           count(*) AS orders,
           sum(total) AS revenue
    FROM orders
    GROUP BY 1
)
SELECT week, orders,
       round(revenue, 2) AS revenue,
       round(sum(revenue) OVER (ORDER BY week), 2) AS running_revenue
FROM weekly
ORDER BY week;
