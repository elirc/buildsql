WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month,
           sum(total) AS revenue
    FROM orders
    GROUP BY 1
),
with_prev AS (
    SELECT month, revenue,
           lag(revenue) OVER (ORDER BY month) AS prev
    FROM monthly
)
SELECT month, revenue,
       round(100 * (revenue - prev) / prev, 1) AS growth_pct
FROM with_prev
ORDER BY month;
