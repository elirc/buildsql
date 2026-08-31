SELECT r.id, r.product_id, r.rating, r.created_at
FROM reviews AS r
ORDER BY r.created_at DESC, r.id DESC
OFFSET 0
LIMIT 10;
