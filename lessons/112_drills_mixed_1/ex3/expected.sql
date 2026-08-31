SELECT c.id, c.name, c.created_at
FROM customers c
WHERE c.country = 'DE'
  AND c.created_at >= '2023-01-01'
  AND NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.id
      AND o.status <> 'cancelled')
ORDER BY c.id;
