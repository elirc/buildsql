SELECT o.customer_id, o.id, o.created_at
FROM orders o
WHERE o.customer_id <= 10
  AND o.created_at = (SELECT max(o2.created_at)
                      FROM orders o2
                      WHERE o2.customer_id = o.customer_id);
