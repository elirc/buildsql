SELECT oi.id, oi.order_id, p.name,
       round(oi.quantity * oi.price, 2) AS line_total,
       round(t.order_total, 2) AS order_total,
       round(100 * (oi.quantity * oi.price) / t.order_total, 2) AS pct_of_order
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN (SELECT order_id, sum(quantity * price) AS order_total
      FROM order_items
      WHERE order_id <= 300
      GROUP BY order_id) t ON t.order_id = oi.order_id
WHERE oi.order_id <= 300
ORDER BY oi.order_id, oi.id;
