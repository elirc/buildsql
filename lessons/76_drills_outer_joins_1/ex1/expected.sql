SELECT c.id, c.name, count(o.id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE c.country = 'ES'
GROUP BY c.id, c.name
ORDER BY c.id;
