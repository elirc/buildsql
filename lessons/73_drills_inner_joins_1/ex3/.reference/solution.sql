SELECT r.id, p.name, r.rating, r.created_at
FROM products p
JOIN reviews r ON r.product_id = p.id
WHERE p.category = 'garden'
  AND r.rating = 1
  AND r.created_at >= '2023-11-01'
ORDER BY r.id;
