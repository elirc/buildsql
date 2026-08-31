SELECT c.id, c.name
FROM customers c
WHERE c.country = 'PH'
  AND EXISTS (SELECT 1 FROM orders o
              WHERE o.customer_id = c.id
                AND o.status <> 'cancelled'
                AND o.total > 1900)
ORDER BY c.id;
