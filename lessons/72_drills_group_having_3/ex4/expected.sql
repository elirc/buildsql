SELECT product_id, count(*) AS five_star
FROM reviews
WHERE rating = 5
GROUP BY product_id
HAVING count(*) > 30
ORDER BY count(*) DESC, product_id;
