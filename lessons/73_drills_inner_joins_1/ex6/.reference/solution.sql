SELECT p.id, p.name, count(r.id) AS reviews
FROM products p
JOIN reviews r ON r.product_id = p.id
GROUP BY p.id
HAVING count(*) > 130
ORDER BY reviews DESC, p.id ASC;
