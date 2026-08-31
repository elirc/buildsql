SELECT id, created_at, rating,
       lag(rating) OVER (ORDER BY created_at, id) AS prev_rating,
       rating - lag(rating) OVER (ORDER BY created_at, id) AS shift
FROM reviews
WHERE product_id = 42
ORDER BY created_at, id;
