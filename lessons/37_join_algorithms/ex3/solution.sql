SELECT r.id, r.rating, p.name
FROM reviews r
JOIN products p ON p.id = r.product_id
WHERE r.product_id = 42;
