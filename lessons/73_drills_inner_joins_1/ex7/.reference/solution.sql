SELECT oi.id AS item_id,
       o.id AS order_id,
       p.name AS product,
       oi.quantity,
       round(oi.price * oi.quantity, 2) AS line_value
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN products p ON p.id = oi.product_id
WHERE o.customer_id = 777
ORDER BY oi.order_id, oi.id;
