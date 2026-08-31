SELECT c.id, c.name, c.created_at
FROM customers c
LEFT JOIN orders o
  ON o.customer_id = c.id
 AND o.status <> 'cancelled'
WHERE c.country = 'DE'
  AND c.created_at >= '2023-01-01'
  AND o.id IS NULL
ORDER BY c.id;
