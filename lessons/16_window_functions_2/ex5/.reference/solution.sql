WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month,
           sum(total) AS revenue
    FROM orders
    GROUP BY 1
)
SELECT month,
       revenue,
       lead(revenue) OVER (ORDER BY month) AS next_month
FROM monthly
ORDER BY month;
