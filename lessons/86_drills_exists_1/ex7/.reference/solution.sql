SELECT c.id, c.name
FROM customers c
WHERE c.country = 'BR'
  AND c.id IN (
      SELECT o.customer_id
      FROM orders o
      WHERE EXISTS (SELECT 1 FROM order_items oi
                    JOIN products p ON p.id = oi.product_id
                    WHERE oi.order_id = o.id AND p.category = 'electronics')
        AND NOT EXISTS (SELECT 1 FROM order_items oi
                        JOIN products p ON p.id = oi.product_id
                        WHERE oi.order_id = o.id AND p.category = 'books'))
ORDER BY c.id;
