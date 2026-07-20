SELECT c.id, c.name, o.id, o.total
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.total > 1900
WHERE c.country = 'MX';
