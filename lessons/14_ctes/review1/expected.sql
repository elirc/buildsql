SELECT c.country, sum(o.total) FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'pending' GROUP BY c.country;
