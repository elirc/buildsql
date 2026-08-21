SELECT p.category, o.status, sum(oi.quantity * oi.price) AS revenue
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders   o ON o.id = oi.order_id
GROUP BY GROUPING SETS ((p.category), (o.status), ());
