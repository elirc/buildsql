SELECT o.id, o.customer_id, o.status
FROM orders o
WHERE o.created_at >= DATE '2023-10-01'
  AND o.created_at <  DATE '2023-11-01'
  AND EXISTS (SELECT 1 FROM orders n
              WHERE n.customer_id = o.customer_id
                AND n.status = o.status
                AND n.created_at >= DATE '2023-11-01')
ORDER BY o.id;
