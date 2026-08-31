SELECT p.id, p.name, count(r.id)
FROM products p
LEFT JOIN reviews r ON r.product_id = p.id
     AND r.rating = 5
     AND r.created_at >= DATE '2023-11-10'
WHERE p.category = 'garden' AND p.price > 480
GROUP BY p.id, p.name
ORDER BY p.id;
