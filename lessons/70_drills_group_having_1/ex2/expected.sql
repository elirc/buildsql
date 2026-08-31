SELECT rating, count(*) AS reviews, count(DISTINCT product_id) AS products
FROM reviews
WHERE rating >= 4
GROUP BY rating
ORDER BY rating;
