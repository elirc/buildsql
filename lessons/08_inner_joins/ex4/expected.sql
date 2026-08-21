SELECT p.category, round(avg(r.rating), 2), count(*)
FROM reviews r
JOIN products p ON p.id = r.product_id
GROUP BY p.category;
