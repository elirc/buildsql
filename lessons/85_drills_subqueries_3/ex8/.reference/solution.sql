WITH firsts AS (
    SELECT customer_id, min(created_at) AS first_at
    FROM orders
    GROUP BY customer_id
), cohort AS (
    SELECT date_trunc('month', first_at) AS month, count(*) AS new_customers
    FROM firsts
    GROUP BY 1
), monthly AS (
    SELECT date_trunc('month', created_at) AS month, count(*) AS orders
    FROM orders
    GROUP BY 1
)
SELECT m.month, m.orders, coalesce(c.new_customers, 0) AS new_customers
FROM monthly m
LEFT JOIN cohort c ON c.month = m.month
ORDER BY m.month;
