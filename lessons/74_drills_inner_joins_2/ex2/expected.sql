SELECT c.name, o.id AS order_id, count(*) AS lines, sum(oi.quantity) AS units
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
WHERE c.id = 1234
GROUP BY c.name, o.id
ORDER BY o.id;
