SELECT c.id, c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
WHERE c.country = 'IN' AND o.id IS NULL
ORDER BY c.id;
