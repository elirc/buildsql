SELECT p.category, o.status,
       count(DISTINCT o.id) AS orders,
       sum(oi.quantity * oi.price) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.created_at >= '2023-11-01'
GROUP BY p.category, o.status
ORDER BY p.category, o.status;
