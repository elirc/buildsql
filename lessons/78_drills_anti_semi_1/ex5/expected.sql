SELECT c.id, c.name
FROM customers c
WHERE c.country = 'JP'
  AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)
  AND NOT EXISTS (SELECT 1
                  FROM orders o
                  JOIN order_items oi ON oi.order_id = o.id
                  JOIN products p ON p.id = oi.product_id
                  WHERE o.customer_id = c.id AND p.category = 'electronics')
ORDER BY c.id;
