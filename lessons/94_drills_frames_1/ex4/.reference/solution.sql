WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month, sum(total) AS revenue
    FROM orders
    GROUP BY 1
)
SELECT month,
       round(revenue, 2) AS revenue,
       round(sum(revenue) OVER ()
             - coalesce(sum(revenue) OVER (ORDER BY month
                                           ROWS BETWEEN UNBOUNDED PRECEDING
                                                    AND 1 PRECEDING), 0), 2)
         AS revenue_from_here,
       count(*) OVER () - row_number() OVER (ORDER BY month) + 1
         AS months_from_here
FROM monthly
ORDER BY month;
