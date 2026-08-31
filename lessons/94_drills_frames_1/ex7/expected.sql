WITH daily AS (
    SELECT date_trunc('day', created_at) AS day, sum(total) AS revenue
    FROM orders
    WHERE created_at >= '2023-09-16'
    GROUP BY 1
), smoothed AS (
    SELECT day, revenue,
           avg(revenue) OVER (ORDER BY day
                              ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma7
    FROM daily
)
SELECT day, round(revenue, 2) AS revenue, round(ma7, 2) AS ma7
FROM smoothed
WHERE revenue > ma7
ORDER BY day;
