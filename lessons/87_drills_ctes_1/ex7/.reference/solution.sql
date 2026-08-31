WITH per_customer AS (
    SELECT customer_id, sum(total) AS revenue
    FROM orders
    WHERE status <> 'cancelled'
    GROUP BY customer_id
)
SELECT customer_id,
       round(revenue, 2) AS revenue,
       round(revenue - (SELECT avg(revenue) FROM per_customer), 2) AS above_average
FROM per_customer
WHERE revenue > 1.8 * (SELECT avg(revenue) FROM per_customer)
ORDER BY revenue DESC, customer_id;
