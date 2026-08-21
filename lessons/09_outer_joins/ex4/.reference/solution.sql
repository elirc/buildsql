SELECT p.id, p.name, count(r.id) AS five_star
FROM products p
LEFT JOIN reviews r ON r.product_id = p.id AND r.rating = 5
WHERE p.category = 'garden'
GROUP BY p.id;
