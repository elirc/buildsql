SELECT p.id, p.name, count(r.id) AS late_five_star
FROM reviews r
RIGHT JOIN products p ON p.id = r.product_id
      AND r.rating = 5
      AND r.created_at >= '2023-11-10'
WHERE p.category = 'garden' AND p.price > 480
GROUP BY p.id, p.name
ORDER BY p.id;
