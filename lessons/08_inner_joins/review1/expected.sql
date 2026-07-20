SELECT c.name, o.id, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE c.country = 'PH' AND o.total > 1950;
