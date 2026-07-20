SELECT c.name, o.id, o.total
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE c.country = 'PH'
  AND o.total > 1950;
