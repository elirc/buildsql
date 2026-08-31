SELECT p.category,
       sum(oi.quantity * oi.price) FILTER (WHERE extract(isodow FROM o.created_at) < 6)  AS weekday_rev,
       sum(oi.quantity * oi.price) FILTER (WHERE extract(isodow FROM o.created_at) >= 6) AS weekend_rev
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN products p ON p.id = oi.product_id
WHERE o.status <> 'cancelled'
GROUP BY p.category
ORDER BY p.category;
