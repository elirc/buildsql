SELECT p.category, sum(oi.quantity), sum(oi.quantity * oi.price)
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.status IN ('paid', 'shipped')
GROUP BY p.category;
