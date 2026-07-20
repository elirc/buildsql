SELECT p.name, sum(oi.quantity * oi.price) AS spent
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
WHERE o.customer_id = 4242
GROUP BY p.name;
