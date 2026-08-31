SELECT id, product_id, rating, created_at
FROM reviews
ORDER BY created_at DESC, id DESC
LIMIT 10;
