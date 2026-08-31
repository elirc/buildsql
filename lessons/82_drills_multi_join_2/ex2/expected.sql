SELECT r.rating,
       count(*) AS reviews,
       count(DISTINCT r.product_id) AS products
FROM reviews r
JOIN products p ON p.id = r.product_id
WHERE p.category = 'books'
GROUP BY r.rating
ORDER BY r.rating;
