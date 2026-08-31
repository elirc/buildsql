SELECT c.id, c.name
FROM customers c
WHERE c.country = 'US'
  AND EXISTS (SELECT 1 FROM orders o
              WHERE o.customer_id = c.id
                AND o.created_at >= '2023-10-01'
                AND o.created_at <  '2023-11-01')
  AND NOT EXISTS (SELECT 1 FROM orders o
                  WHERE o.customer_id = c.id
                    AND o.created_at >= '2023-11-01')
ORDER BY c.id;
