SELECT p.id, p.name, p.price
FROM products p
LEFT JOIN (SELECT DISTINCT product_id FROM order_items) AS sold
       ON sold.product_id = p.id
WHERE p.category = 'toys'
  AND sold.product_id IS NULL
  AND p.id IN (SELECT r.product_id FROM reviews r WHERE r.rating = 5)
ORDER BY p.id;
