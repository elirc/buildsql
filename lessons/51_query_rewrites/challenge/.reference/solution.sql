SELECT c.id, c.name
FROM customers c
WHERE c.id IN (SELECT o.customer_id
               FROM orders o
               WHERE o.created_at >= TIMESTAMPTZ '2023-06-15 00:00:00+00'
                 AND o.created_at <  TIMESTAMPTZ '2023-06-16 00:00:00+00')
UNION
SELECT c.id, c.name
FROM customers c
WHERE c.email = 'user4242@example.com'
  AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
