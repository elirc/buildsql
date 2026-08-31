SELECT oi.id, p.name, c.name, c.country, oi.quantity
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE p.category = 'garden'
  AND p.price > 495
ORDER BY oi.id;
