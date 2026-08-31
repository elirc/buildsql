SELECT r.rating,
       count(*) FILTER (WHERE p.category = 'books') AS books,
       count(*) FILTER (WHERE p.category = 'clothing') AS clothing,
       count(*) FILTER (WHERE p.category = 'electronics') AS electronics,
       count(*) FILTER (WHERE p.category = 'food') AS food,
       count(*) FILTER (WHERE p.category = 'garden') AS garden,
       count(*) FILTER (WHERE p.category = 'toys') AS toys
FROM reviews r
JOIN products p ON p.id = r.product_id
GROUP BY r.rating
ORDER BY r.rating;
