WITH weekly AS (
    SELECT date_trunc('week', created_at) AS week, status, sum(total) AS revenue
    FROM orders
    GROUP BY 1, 2
)
SELECT week, status,
       round(revenue, 2) AS revenue,
       round(avg(revenue) OVER (PARTITION BY status ORDER BY week
                                ROWS BETWEEN 3 PRECEDING AND CURRENT ROW), 2)
         AS ma4
FROM weekly
ORDER BY status, week;
