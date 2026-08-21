SELECT c.id, c.name
FROM customers c
WHERE c.country = 'JP'
  AND c.id IN (SELECT o.customer_id FROM orders o WHERE o.status = 'cancelled');
