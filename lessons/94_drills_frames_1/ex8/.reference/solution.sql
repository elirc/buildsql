WITH weekly AS (
    SELECT date_trunc('week', created_at) AS week, sum(total) AS revenue
    FROM orders
    GROUP BY 1
), averages AS (
    SELECT w.week, w.revenue,
           (SELECT avg(n.revenue) FROM weekly n
            WHERE n.week BETWEEN w.week - INTERVAL '3 weeks' AND w.week) AS ma4,
           (SELECT avg(n.revenue) FROM weekly n
            WHERE n.week BETWEEN w.week - INTERVAL '11 weeks' AND w.week) AS ma12
    FROM weekly w
)
SELECT week,
       round(revenue, 2) AS revenue,
       round(ma4, 2) AS ma4,
       round(ma12, 2) AS ma12,
       CASE WHEN ma4 > ma12 THEN 'above' ELSE 'below' END AS signal
FROM averages
ORDER BY week;
