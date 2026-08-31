SELECT c.id, c.name
FROM customers c
WHERE c.country = 'PH'
  AND c.id IN (SELECT o.customer_id FROM orders o
               WHERE o.status <> 'cancelled' AND o.total > 1900)
ORDER BY c.id;
