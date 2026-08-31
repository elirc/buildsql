SELECT p.category,
       count(DISTINCT r.product_id),
       count(*),
       round(avg(r.rating), 2)
FROM reviews r
JOIN products p ON p.id = r.product_id
WHERE r.created_at >= DATE '2023-08-01'
GROUP BY p.category
ORDER BY 1;
