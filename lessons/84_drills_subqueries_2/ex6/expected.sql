SELECT o.id, o.customer_id, o.status
FROM orders o
WHERE o.created_at >= '2023-10-01'
  AND o.created_at <  '2023-11-01'
  AND (o.customer_id, o.status) IN (SELECT n.customer_id, n.status
                                    FROM orders n
                                    WHERE n.created_at >= '2023-11-01')
ORDER BY o.id;
