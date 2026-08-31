SELECT oi.id AS item_id,
       o.id AS order_id,
       p.name AS product,
       oi.quantity,
       round(oi.quantity * oi.price, 2) AS line_value
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.customer_id = 777
ORDER BY o.id, oi.id;
