SELECT o.id, o.status, x.name AS product
FROM orders o
LEFT JOIN (SELECT oi.order_id, p.name
           FROM order_items oi
           JOIN products p ON p.id = oi.product_id
           WHERE p.price > 400) x ON x.order_id = o.id
WHERE o.customer_id <= 3
ORDER BY o.id, x.name NULLS FIRST;
