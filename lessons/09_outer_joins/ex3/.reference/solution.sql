SELECT p.id, p.name, count(r.id) AS reviews
FROM products p
LEFT JOIN reviews r ON r.product_id = p.id
WHERE p.category = 'toys'
GROUP BY p.id;
