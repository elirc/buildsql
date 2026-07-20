SELECT p.category, sum(oi.quantity * oi.price)
FROM order_items oi
JOIN products p ON p.id = oi.product_id
GROUP BY p.category;
