SELECT c.name, o.id AS order_id, count(oi.id) AS lines, sum(oi.quantity) AS units
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE o.customer_id = 1234
GROUP BY c.name, o.id
ORDER BY o.id;
