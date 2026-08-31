SELECT p.category,
       sum(oi.quantity) AS units,
       sum(oi.quantity * oi.price) AS revenue,
       count(DISTINCT o.id) AS orders,
       count(DISTINCT o.customer_id) AS buyers,
       round(avg(oi.quantity * oi.price), 2) AS avg_line_revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.created_at >= '2023-10-01'
GROUP BY p.category
HAVING avg(oi.quantity * oi.price) > 750
ORDER BY revenue DESC, p.category;
