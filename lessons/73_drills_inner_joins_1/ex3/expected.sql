SELECT r.id, p.name, r.rating, r.created_at
FROM reviews r
JOIN products p ON p.id = r.product_id
WHERE p.category = 'garden'
  AND r.rating = 1
  AND r.created_at >= DATE '2023-11-01'
ORDER BY r.id;
