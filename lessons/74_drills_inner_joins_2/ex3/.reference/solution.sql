SELECT p.category,
       round(sum(oi.price * oi.quantity), 2) AS revenue,
       count(oi.id) AS lines
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.status = 'paid'
GROUP BY p.category
ORDER BY 1;
