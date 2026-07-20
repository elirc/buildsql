SELECT p.category,
       sum(oi.quantity * oi.price) FILTER (WHERE o.status = 'pending')   AS pending,
       sum(oi.quantity * oi.price) FILTER (WHERE o.status = 'paid')      AS paid,
       sum(oi.quantity * oi.price) FILTER (WHERE o.status = 'shipped')   AS shipped,
       sum(oi.quantity * oi.price) FILTER (WHERE o.status = 'cancelled') AS cancelled
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
GROUP BY p.category;
