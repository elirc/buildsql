SELECT count(*) AS reviews,
       round(avg(rating), 2) AS avg_rating,
       min(rating) AS worst,
       max(rating) AS best
FROM reviews
WHERE product_id = 42;
