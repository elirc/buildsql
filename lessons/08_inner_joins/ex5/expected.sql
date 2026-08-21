SELECT oi.id, p.name, oi.quantity, oi.price
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE p.category = 'electronics'
  AND oi.quantity = 5
  AND oi.price > 480;
