SELECT o.id, o.total, count(oi.id) AS big_lines
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN order_items oi ON oi.order_id = o.id AND oi.quantity = 5
WHERE c.country = 'MX' AND o.created_at >= '2023-11-01'
GROUP BY o.id, o.total
ORDER BY o.id;
