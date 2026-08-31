SELECT p.category, r.rating, count(*) AS reviews
FROM reviews r
JOIN products p ON p.id = r.product_id
WHERE r.created_at >= '2023-06-01'
GROUP BY GROUPING SETS ((p.category), (r.rating))
ORDER BY p.category, r.rating;
