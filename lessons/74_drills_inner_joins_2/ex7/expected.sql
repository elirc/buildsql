SELECT c.name, p.category,
       count(*) AS lines,
       round(sum(oi.quantity * oi.price), 2) AS spend
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE c.id = 4242
GROUP BY c.name, p.category
ORDER BY p.category;
