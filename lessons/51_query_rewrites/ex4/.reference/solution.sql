SELECT p.id, p.name
FROM products p
WHERE p.category = 'garden'
  AND EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id);
