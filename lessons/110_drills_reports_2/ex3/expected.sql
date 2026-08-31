SELECT p.id, p.name,
       count(*) AS reviews,
       round(avg(r.rating), 2) AS avg_rating
FROM products p
JOIN reviews r ON r.product_id = p.id
GROUP BY p.id, p.name
HAVING count(*) >= 100
ORDER BY avg(r.rating) ASC, p.id ASC
LIMIT 10;
