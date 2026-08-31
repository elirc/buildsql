SELECT c.id, c.name
FROM customers c
JOIN (SELECT customer_id FROM orders
      WHERE created_at >= DATE '2023-10-01'
        AND created_at <  DATE '2023-11-01'
      EXCEPT
      SELECT customer_id FROM orders
      WHERE created_at >= DATE '2023-11-01') x ON x.customer_id = c.id
WHERE c.country = 'US'
ORDER BY c.id;
