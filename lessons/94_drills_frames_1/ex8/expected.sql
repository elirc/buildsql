WITH weekly AS (
    SELECT date_trunc('week', created_at) AS week, sum(total) AS revenue
    FROM orders
    GROUP BY 1
), averages AS (
    SELECT week, revenue,
           avg(revenue) OVER (ORDER BY week
                              ROWS BETWEEN 3 PRECEDING AND CURRENT ROW) AS ma4,
           avg(revenue) OVER (ORDER BY week
                              ROWS BETWEEN 11 PRECEDING AND CURRENT ROW) AS ma12
    FROM weekly
)
SELECT week,
       round(revenue, 2) AS revenue,
       round(ma4, 2) AS ma4,
       round(ma12, 2) AS ma12,
       CASE WHEN ma4 > ma12 THEN 'above' ELSE 'below' END AS signal
FROM averages
ORDER BY week;
