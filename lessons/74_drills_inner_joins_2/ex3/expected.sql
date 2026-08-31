SELECT p.category,
       round(sum(oi.quantity * oi.price), 2) AS revenue,
       count(*) AS lines
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN products p ON p.id = oi.product_id
WHERE o.status = 'paid'
GROUP BY p.category
ORDER BY p.category;
