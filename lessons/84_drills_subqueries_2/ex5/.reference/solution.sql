WITH per_customer AS (
    SELECT customer_id, count(*) AS orders
    FROM orders
    WHERE customer_id <= 10000 AND status <> 'cancelled'
    GROUP BY customer_id
)
SELECT pc.customer_id, pc.orders
FROM per_customer pc
WHERE pc.orders > (SELECT avg(orders) FROM per_customer)
ORDER BY pc.orders DESC, pc.customer_id;
