SELECT p.category,
       o.status,
       sum(oi.quantity * oi.price) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
GROUP BY CUBE (p.category, o.status);
