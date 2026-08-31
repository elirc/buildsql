SELECT p.category, NULL::int AS rating, count(*) AS reviews
FROM reviews r
JOIN products p ON p.id = r.product_id
WHERE r.created_at >= '2023-06-01'
GROUP BY p.category
UNION ALL
SELECT NULL::text, r.rating, count(*)
FROM reviews r
JOIN products p ON p.id = r.product_id
WHERE r.created_at >= '2023-06-01'
GROUP BY r.rating
ORDER BY 1, 2;
