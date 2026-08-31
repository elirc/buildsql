SELECT DISTINCT ON (p.category)
       p.category, r.id AS review_id, r.rating, r.created_at
FROM reviews r
JOIN products p ON p.id = r.product_id
ORDER BY p.category, r.created_at DESC, r.id DESC;
