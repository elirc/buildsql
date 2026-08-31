SELECT r.product_id, r.rating
FROM reviews AS r
GROUP BY r.product_id, r.rating;
