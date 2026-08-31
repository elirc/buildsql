SELECT count(*) AS reviews,
       count(DISTINCT r.product_id) AS products_covered,
       round(avg(r.rating), 2) AS avg_rating,
       round(100.0 * count(*) FILTER (WHERE r.rating <= 2) / count(*), 2) AS negative_pct
FROM reviews r
JOIN products p ON p.id = r.product_id
WHERE p.category = 'electronics';
