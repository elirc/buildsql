SELECT p.id, p.name, count(*) AS reviews
FROM reviews r
JOIN products p ON p.id = r.product_id
GROUP BY p.id, p.name
HAVING count(*) > 130
ORDER BY count(*) DESC, p.id;
