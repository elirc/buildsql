SELECT p.id, p.name, p.price
FROM products p
WHERE p.category = 'toys'
  AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id)
  AND EXISTS (SELECT 1 FROM reviews r
              WHERE r.product_id = p.id AND r.rating = 5)
ORDER BY p.id;
