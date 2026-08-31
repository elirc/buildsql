SELECT p.attributes ->> 'color' AS color,
       sum(oi.quantity * oi.price) AS revenue
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE p.category = 'clothing'
GROUP BY p.attributes ->> 'color'
ORDER BY color;
