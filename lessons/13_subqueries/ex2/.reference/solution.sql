SELECT id, total
FROM orders
WHERE id IN (SELECT oi.order_id
             FROM order_items oi
             JOIN products p ON p.id = oi.product_id
             WHERE p.price > 490);
