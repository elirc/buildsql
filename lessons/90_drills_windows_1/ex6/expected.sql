WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month, status, sum(total) AS revenue
    FROM orders
    GROUP BY 1, 2
)
SELECT month, status, round(revenue, 2) AS revenue,
       rank() OVER (PARTITION BY month ORDER BY revenue DESC) AS rnk
FROM monthly
ORDER BY month, rnk, status;
