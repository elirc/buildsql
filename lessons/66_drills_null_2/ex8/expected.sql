SELECT p.id, p.name,
       count(r.id) AS recent_5star,
       round(avg(r.rating), 2) AS avg_recent,
       round(avg(coalesce(r.rating, 0)), 2) AS avg_zero_filled
FROM products p
LEFT JOIN reviews r
       ON r.product_id = p.id
      AND r.rating = 5
      AND r.created_at >= DATE '2023-11-01'
WHERE p.category = 'books'
GROUP BY p.id, p.name
ORDER BY p.id;
