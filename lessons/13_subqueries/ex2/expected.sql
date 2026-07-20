SELECT o.id, o.total FROM orders o
WHERE EXISTS (SELECT 1 FROM order_items oi
              JOIN products p ON p.id = oi.product_id
              WHERE oi.order_id = o.id AND p.price > 490);
