SELECT o.id, o.total, coalesce(s.lines, 0), coalesce(s.units, 0)
FROM orders o
LEFT JOIN (SELECT order_id, count(*) AS lines, sum(quantity) AS units
           FROM order_items
           WHERE order_id <= 300
           GROUP BY order_id) s ON s.order_id = o.id
WHERE o.id <= 300
ORDER BY o.id;
