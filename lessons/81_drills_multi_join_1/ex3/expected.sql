SELECT date_trunc('month', o.created_at) AS month,
       p.category,
       sum(oi.quantity * oi.price) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.created_at >= '2023-10-01'
GROUP BY 1, 2
ORDER BY 1, 2;
