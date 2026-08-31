SELECT product_id,
       count(*) FILTER (WHERE rating = 1) AS stars_1,
       count(*) FILTER (WHERE rating = 2) AS stars_2,
       count(*) FILTER (WHERE rating = 3) AS stars_3,
       count(*) FILTER (WHERE rating = 4) AS stars_4,
       count(*) FILTER (WHERE rating = 5) AS stars_5
FROM reviews
WHERE product_id <= 20
GROUP BY product_id
ORDER BY product_id;
