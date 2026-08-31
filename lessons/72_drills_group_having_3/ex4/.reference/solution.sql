SELECT product_id, count(*) AS five_star
FROM reviews
WHERE rating = 5
GROUP BY product_id
HAVING count(*) > 30
ORDER BY five_star DESC, product_id ASC;
