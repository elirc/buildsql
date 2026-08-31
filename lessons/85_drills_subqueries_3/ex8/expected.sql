WITH firsts AS (
    SELECT customer_id, min(created_at) AS first_at
    FROM orders
    GROUP BY customer_id
), monthly AS (
    SELECT date_trunc('month', created_at) AS month, count(*) AS orders
    FROM orders
    GROUP BY 1
)
SELECT m.month, m.orders,
       (SELECT count(*) FROM firsts f
        WHERE date_trunc('month', f.first_at) = m.month) AS new_customers
FROM monthly m
ORDER BY m.month;
