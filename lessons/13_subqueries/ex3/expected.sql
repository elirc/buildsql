SELECT c.id, c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE c.country = 'ES' AND o.id IS NULL;
