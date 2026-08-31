SELECT p.id, p.name, r.review_id, r.rating
FROM products p
LEFT JOIN (
  SELECT DISTINCT ON (product_id)
         product_id, id AS review_id, rating
  FROM reviews
  ORDER BY product_id, created_at DESC, id DESC) r
  ON r.product_id = p.id
WHERE p.id <= 12
ORDER BY p.id;
