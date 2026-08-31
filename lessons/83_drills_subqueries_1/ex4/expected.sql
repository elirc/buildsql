SELECT p.id, p.name
FROM products p
WHERE p.category = 'clothing'
  AND p.id NOT IN (SELECT r.product_id
                   FROM reviews r
                   WHERE r.rating = 1
                     AND r.created_at >= '2023-11-01')
ORDER BY p.id;
