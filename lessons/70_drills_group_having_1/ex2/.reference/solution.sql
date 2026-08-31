SELECT rating, count(*) AS reviews, count(DISTINCT product_id) AS products
FROM reviews
WHERE rating IN (4, 5)
GROUP BY rating
ORDER BY rating;
