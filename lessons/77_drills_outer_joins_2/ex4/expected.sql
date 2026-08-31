SELECT o.id, o.status, p.name AS product
FROM orders o
LEFT JOIN (order_items oi JOIN products p
           ON p.id = oi.product_id AND p.price > 400)
       ON oi.order_id = o.id
WHERE o.customer_id <= 3
ORDER BY o.id, p.name NULLS FIRST;
