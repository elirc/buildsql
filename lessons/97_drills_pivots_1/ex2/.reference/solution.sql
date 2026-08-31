SELECT product_id,
       sum(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS stars_1,
       sum(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS stars_2,
       sum(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS stars_3,
       sum(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS stars_4,
       sum(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS stars_5
FROM reviews
WHERE product_id <= 20
GROUP BY 1
ORDER BY 1;
