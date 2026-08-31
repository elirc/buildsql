SELECT o.id, o.total,
       count(oi.id) AS lines,
       coalesce(sum(oi.quantity), 0) AS units
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.id <= 300
GROUP BY o.id, o.total
ORDER BY o.id;
