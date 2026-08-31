WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month, sum(total) AS revenue
    FROM orders
    GROUP BY 1
)
SELECT month,
       round(revenue, 2) AS revenue,
       round(sum(revenue) OVER (ORDER BY month), 2) AS running_by_month,
       round(sum(revenue) OVER (ORDER BY revenue DESC, month), 2) AS running_by_size
FROM monthly
ORDER BY month;
