SELECT oi.id, oi.order_id, p.name,
       round(oi.quantity * oi.price, 2) AS line_total,
       round(sum(oi.quantity * oi.price) OVER (PARTITION BY oi.order_id), 2)
         AS order_total,
       round(100 * (oi.quantity * oi.price)
             / sum(oi.quantity * oi.price) OVER (PARTITION BY oi.order_id), 2)
         AS pct_of_order
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE oi.order_id <= 300
ORDER BY oi.order_id, oi.id;
