WITH per_order_category AS (
    SELECT o.id AS order_id, o.status, p.category,
           sum(oi.quantity * oi.price) AS revenue
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    WHERE o.created_at >= DATE '2023-11-01'
    GROUP BY o.id, o.status, p.category
)
SELECT category, status, count(*) AS orders, sum(revenue) AS revenue
FROM per_order_category
GROUP BY category, status
ORDER BY category, status;
