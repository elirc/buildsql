WITH seq AS (
  SELECT id, created_at, rating,
         lag(rating) OVER (ORDER BY created_at, id) AS prev_rating
  FROM reviews
  WHERE product_id = 42)
SELECT id, created_at, rating, prev_rating, rating - prev_rating AS shift
FROM seq
ORDER BY created_at, id;
