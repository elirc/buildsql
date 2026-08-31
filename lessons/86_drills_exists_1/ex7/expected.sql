SELECT c.id, c.name
FROM customers c
WHERE c.country = 'BR'
  AND EXISTS (SELECT 1
              FROM orders o
              JOIN order_items oi ON oi.order_id = o.id
              JOIN products p ON p.id = oi.product_id
              WHERE o.customer_id = c.id
                AND p.category = 'electronics'
                AND NOT EXISTS (SELECT 1
                                FROM order_items oi2
                                JOIN products p2 ON p2.id = oi2.product_id
                                WHERE oi2.order_id = o.id
                                  AND p2.category = 'books'))
ORDER BY c.id;
