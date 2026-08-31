SELECT p.id, p.name,
       coalesce(s.units, 0) AS units,
       coalesce(r.reviews, 0) AS reviews,
       r.avg_rating
FROM products p
LEFT JOIN (SELECT product_id, sum(quantity) AS units
           FROM order_items
           GROUP BY product_id) s ON s.product_id = p.id
LEFT JOIN (SELECT product_id, count(*) AS reviews, round(avg(rating), 2) AS avg_rating
           FROM reviews
           GROUP BY product_id) r ON r.product_id = p.id
WHERE p.category = 'electronics' AND p.price > 495
ORDER BY p.id;
