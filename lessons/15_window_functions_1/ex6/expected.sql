WITH ranked AS (
    SELECT customer_id, id, created_at,
           row_number() OVER (PARTITION BY customer_id
                              ORDER BY created_at DESC, id DESC) AS rn
    FROM orders
    WHERE customer_id <= 50
)
SELECT customer_id, id, created_at
FROM ranked
WHERE rn = 1;
