SELECT p.category,
       count(r.id) AS reviews,
       count(CASE WHEN r.rating < 3 THEN 1 END) AS negative,
       count(CASE WHEN r.rating = 3 THEN 1 END) AS neutral,
       count(CASE WHEN r.rating > 3 THEN 1 END) AS positive,
       round(avg(r.rating), 3) AS avg_rating
FROM products p
JOIN reviews r ON r.product_id = p.id
GROUP BY 1
ORDER BY 1;
