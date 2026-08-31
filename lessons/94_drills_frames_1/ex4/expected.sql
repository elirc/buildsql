WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month, sum(total) AS revenue
    FROM orders
    GROUP BY 1
)
SELECT month,
       round(revenue, 2) AS revenue,
       round(sum(revenue) OVER (ORDER BY month
                                ROWS BETWEEN CURRENT ROW
                                         AND UNBOUNDED FOLLOWING), 2)
         AS revenue_from_here,
       count(*) OVER (ORDER BY month
                      ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING)
         AS months_from_here
FROM monthly
ORDER BY month;
