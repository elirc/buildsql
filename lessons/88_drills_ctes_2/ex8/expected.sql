WITH recent_orders AS (
    SELECT id, customer_id
    FROM orders
    WHERE created_at >= '2023-09-01'
), lines AS (
    SELECT o.customer_id, oi.product_id, oi.quantity * oi.price AS line_revenue
    FROM order_items oi
    JOIN recent_orders o ON o.id = oi.order_id
), enriched AS (
    SELECT p.category, l.customer_id, l.line_revenue
    FROM lines l
    JOIN products p ON p.id = l.product_id
)
SELECT category,
       round(sum(line_revenue), 2) AS revenue,
       count(DISTINCT customer_id) AS buyers,
       round(sum(line_revenue) / count(DISTINCT customer_id), 2) AS revenue_per_buyer
FROM enriched
GROUP BY category
ORDER BY revenue DESC;
