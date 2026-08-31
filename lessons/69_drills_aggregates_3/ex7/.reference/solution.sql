SELECT count(*) AS reviews,
       count(DISTINCT p.id) AS products_covered,
       round(avg(r.rating), 2) AS avg_rating,
       round(100.0 * sum(CASE WHEN r.rating <= 2 THEN 1 ELSE 0 END) / count(*), 2) AS negative_pct
FROM reviews r
JOIN products p ON p.id = r.product_id
WHERE p.category = 'electronics';
