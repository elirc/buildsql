SELECT p.category,
       sum(oi.quantity * oi.price) AS revenue,
       round(100 * sum(oi.quantity * oi.price)
             / (SELECT sum(oi2.quantity * oi2.price)
                FROM order_items oi2
                JOIN orders o2 ON o2.id = oi2.order_id
                WHERE o2.created_at >= '2023-11-01'), 2) AS pct
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.created_at >= '2023-11-01'
GROUP BY p.category
ORDER BY revenue DESC, p.category;
