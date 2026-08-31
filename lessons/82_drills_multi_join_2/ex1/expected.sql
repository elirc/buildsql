SELECT p.category,
       count(DISTINCT p.id) AS products,
       count(r.id) AS reviews,
       round(avg(r.rating), 2) AS avg_rating
FROM products p
JOIN reviews r ON r.product_id = p.id
WHERE r.created_at >= '2023-08-01'
GROUP BY p.category
ORDER BY p.category;
