SELECT p.id, p.name, t.review_id, t.rating
FROM products p
LEFT JOIN LATERAL (
  SELECT r.id AS review_id, r.rating
  FROM reviews r
  WHERE r.product_id = p.id
  ORDER BY r.created_at DESC, r.id DESC
  LIMIT 1) t ON true
WHERE p.id <= 12
ORDER BY p.id;
