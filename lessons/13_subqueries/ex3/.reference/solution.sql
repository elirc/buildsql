SELECT c.id, c.name
FROM customers c
WHERE c.country = 'ES'
  AND NOT EXISTS (SELECT 1 FROM orders o
                  WHERE o.customer_id = c.id);
