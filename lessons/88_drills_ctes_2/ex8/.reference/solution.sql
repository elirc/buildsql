SELECT p.category,
       round(sum(oi.quantity * oi.price), 2) AS revenue,
       count(DISTINCT o.customer_id) AS buyers,
       round(sum(oi.quantity * oi.price) / count(DISTINCT o.customer_id), 2)
         AS revenue_per_buyer
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN products p ON p.id = oi.product_id
WHERE o.created_at >= '2023-09-01'
GROUP BY p.category
ORDER BY revenue DESC;
