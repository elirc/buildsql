WITH per_customer AS (
    SELECT customer_id, sum(total) AS revenue
    FROM orders
    WHERE status <> 'cancelled'
    GROUP BY customer_id
), threshold AS (
    SELECT 2 * avg(revenue) AS cutoff FROM per_customer
)
SELECT pc.customer_id, pc.revenue
FROM per_customer pc, threshold
WHERE pc.revenue > threshold.cutoff
ORDER BY pc.revenue DESC, pc.customer_id;
