SELECT r.rating,
       count(CASE WHEN p.category = 'books' THEN 1 END) AS books,
       count(CASE WHEN p.category = 'clothing' THEN 1 END) AS clothing,
       count(CASE WHEN p.category = 'electronics' THEN 1 END) AS electronics,
       count(CASE WHEN p.category = 'food' THEN 1 END) AS food,
       count(CASE WHEN p.category = 'garden' THEN 1 END) AS garden,
       count(CASE WHEN p.category = 'toys' THEN 1 END) AS toys
FROM products p
JOIN reviews r ON r.product_id = p.id
GROUP BY 1
ORDER BY 1;
