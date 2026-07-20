SELECT c.id, c.name, sum(o.total) FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status IN ('paid', 'shipped')
GROUP BY c.id, c.name
ORDER BY sum(o.total) DESC, c.id LIMIT 10;
