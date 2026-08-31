WITH monthly AS (
    SELECT date_trunc('month', o.created_at) AS month,
           c.country,
           sum(o.total) AS revenue
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    GROUP BY 1, 2
), per_month AS (
    SELECT month, sum(revenue) AS month_revenue
    FROM monthly
    GROUP BY month
), ranked AS (
    SELECT m.month, m.country, m.revenue, p.month_revenue,
           rank() OVER (PARTITION BY m.month
                        ORDER BY m.revenue DESC, m.country) AS rn
    FROM monthly m
    JOIN per_month p ON p.month = m.month
)
SELECT month, country,
       round(revenue, 2) AS revenue,
       round(100 * revenue / month_revenue, 2) AS pct_of_month,
       rn
FROM ranked
WHERE rn <= 2
ORDER BY month, rn;
