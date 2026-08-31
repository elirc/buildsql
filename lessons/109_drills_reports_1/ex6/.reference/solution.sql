SELECT p.category,
       sum(CASE WHEN extract(isodow FROM o.created_at) < 6
                THEN oi.quantity * oi.price ELSE 0 END) AS weekday_rev,
       sum(CASE WHEN extract(isodow FROM o.created_at) >= 6
                THEN oi.quantity * oi.price ELSE 0 END) AS weekend_rev
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN products p ON p.id = oi.product_id
WHERE o.status <> 'cancelled'
GROUP BY p.category
ORDER BY p.category;
