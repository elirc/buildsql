WITH weekly AS (
    SELECT date_trunc('week', created_at) AS week, status, sum(total) AS revenue
    FROM orders
    GROUP BY 1, 2
)
SELECT w.week, w.status,
       round(w.revenue, 2) AS revenue,
       round((SELECT avg(n.revenue) FROM weekly n
              WHERE n.status = w.status
                AND n.week BETWEEN w.week - INTERVAL '3 weeks'
                               AND w.week), 2) AS ma4
FROM weekly w
ORDER BY w.status, w.week;
