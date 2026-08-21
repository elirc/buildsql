SELECT DISTINCT ON (product_id) product_id, id, rating
FROM reviews
WHERE product_id <= 20
ORDER BY product_id, rating DESC, id;
