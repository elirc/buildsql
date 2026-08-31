SELECT p.id, p.name,
       coalesce(sum(oi.quantity) FILTER (WHERE o.status <> 'cancelled'), 0) AS good_units,
       coalesce(sum(oi.quantity) FILTER (WHERE o.status = 'cancelled'), 0) AS lost_units
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.quantity = 5
LEFT JOIN orders o ON o.id = oi.order_id AND o.created_at >= '2023-11-01'
WHERE p.category = 'toys' AND p.price > 490
GROUP BY p.id, p.name
ORDER BY p.id;
