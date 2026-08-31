SELECT r.rating, count(*), count(DISTINCT r.product_id)
FROM reviews r
WHERE r.product_id IN (SELECT id FROM products WHERE category = 'books')
GROUP BY r.rating
ORDER BY r.rating;
