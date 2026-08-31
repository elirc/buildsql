SELECT p.category,
       count(*) AS reviews,
       count(*) FILTER (WHERE r.rating <= 2) AS negative,
       count(*) FILTER (WHERE r.rating = 3) AS neutral,
       count(*) FILTER (WHERE r.rating >= 4) AS positive,
       round(avg(r.rating), 3) AS avg_rating
FROM reviews r
JOIN products p ON p.id = r.product_id
GROUP BY p.category
ORDER BY p.category;
