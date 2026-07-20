SELECT p.name, oi.quantity, oi.price
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE oi.order_id = 123;
