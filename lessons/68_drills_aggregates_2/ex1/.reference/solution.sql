SELECT count(rating) AS reviews,
       round(sum(rating)::numeric / count(*), 2) AS avg_rating,
       min(rating) AS worst,
       max(rating) AS best
FROM reviews
WHERE product_id = 42;
