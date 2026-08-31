WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month, sum(total) AS revenue
    FROM orders
    GROUP BY 1
)
SELECT month,
       round(revenue, 2) AS revenue,
       round(sum(revenue) OVER (ORDER BY month), 2) AS running_revenue,
       round(max(revenue) OVER (ORDER BY month), 2) AS best_so_far
FROM monthly
ORDER BY month;
