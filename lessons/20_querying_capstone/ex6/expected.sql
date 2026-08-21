WITH per_order AS (
    SELECT o.id, date_trunc('month', o.created_at) AS month, count(*) AS items
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.created_at >= '2023-01-01' AND o.created_at < '2024-01-01'
    GROUP BY o.id, 2
)
SELECT month, round(avg(items), 3) AS avg_items
FROM per_order
GROUP BY month
ORDER BY month;
