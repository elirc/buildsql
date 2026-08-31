WITH monthly AS (
    SELECT date_trunc('month', o.created_at) AS month,
           c.country,
           sum(o.total) AS revenue
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    GROUP BY 1, 2
), ranked AS (
    SELECT month, country, revenue,
           sum(revenue) OVER (PARTITION BY month) AS month_revenue,
           row_number() OVER (PARTITION BY month
                              ORDER BY revenue DESC, country) AS rn
    FROM monthly
)
SELECT month, country,
       round(revenue, 2) AS revenue,
       round(100 * revenue / month_revenue, 2) AS pct_of_month,
       rn
FROM ranked
WHERE rn <= 2
ORDER BY month, rn;
