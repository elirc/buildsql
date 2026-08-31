SELECT c.name, p.category,
       count(oi.id) AS lines,
       round(sum(oi.price * oi.quantity), 2) AS spend
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
JOIN products p ON p.id = oi.product_id
WHERE o.customer_id = 4242
GROUP BY c.name, p.category
ORDER BY 1, 2;
