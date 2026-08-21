SELECT c.id, c.name
FROM customers c
WHERE c.id IN (SELECT o.customer_id
               FROM orders o
               JOIN order_items oi ON oi.order_id = o.id
               JOIN products p ON p.id = oi.product_id
               WHERE p.category = 'electronics')
  AND c.id NOT IN (SELECT o.customer_id
                   FROM orders o
                   JOIN order_items oi ON oi.order_id = o.id
                   JOIN products p ON p.id = oi.product_id
                   WHERE p.category = 'books');
