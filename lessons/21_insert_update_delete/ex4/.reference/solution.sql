UPDATE orders o
SET status = 'cancelled'
FROM customers c
WHERE c.id = o.customer_id
  AND c.country = 'JP'
  AND o.status = 'pending';
