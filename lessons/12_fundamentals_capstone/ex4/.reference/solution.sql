SELECT c.id, c.name
FROM customers c
WHERE c.created_at >= '2023-07-01'
  AND c.created_at <  '2023-10-01'
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
