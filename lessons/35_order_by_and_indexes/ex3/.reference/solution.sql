SELECT id, rating, created_at
FROM reviews
WHERE product_id = 42
ORDER BY created_at DESC
LIMIT 10;
