SELECT c.id, c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE c.created_at >= '2023-07-01'
  AND c.created_at <  '2023-10-01'
  AND o.id IS NULL;
