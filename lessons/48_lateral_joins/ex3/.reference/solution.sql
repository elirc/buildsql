SELECT c.id AS customer_id, recent.id, recent.created_at
FROM customers c
CROSS JOIN LATERAL (
    SELECT o.id, o.created_at
    FROM orders o
    WHERE o.customer_id = c.id
    ORDER BY o.created_at DESC, o.id DESC
    LIMIT 2
) AS recent
WHERE c.id <= 20;
