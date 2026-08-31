SELECT c.id, c.name,
       count(DISTINCT o.id) AS orders,
       coalesce(sum(oi.quantity), 0) AS units
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE c.country = 'BR' AND c.created_at >= '2023-06-01'
GROUP BY c.id, c.name
ORDER BY c.id;
