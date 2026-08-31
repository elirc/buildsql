WITH per_customer AS (
    SELECT customer_id, sum(total) AS revenue
    FROM orders
    WHERE status <> 'cancelled'
    GROUP BY customer_id
), stats AS (
    SELECT avg(revenue) AS avg_revenue
    FROM per_customer
)
SELECT pc.customer_id,
       round(pc.revenue, 2) AS revenue,
       round(pc.revenue - s.avg_revenue, 2) AS above_average
FROM per_customer pc
CROSS JOIN stats s
WHERE pc.revenue > 1.8 * s.avg_revenue
ORDER BY pc.revenue DESC, pc.customer_id;
