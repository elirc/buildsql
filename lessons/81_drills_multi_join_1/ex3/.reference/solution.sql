WITH lines AS (
    SELECT date_trunc('month', o.created_at) AS month,
           oi.product_id,
           oi.quantity * oi.price AS line_revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.created_at >= DATE '2023-10-01'
)
SELECT l.month, p.category, sum(l.line_revenue) AS revenue
FROM lines l
JOIN products p ON p.id = l.product_id
GROUP BY l.month, p.category
ORDER BY l.month, p.category;
