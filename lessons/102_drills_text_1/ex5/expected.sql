SELECT category,
       count(*) AS products,
       string_agg(name, ', ' ORDER BY id) AS names
FROM products
WHERE id <= 60
GROUP BY category
ORDER BY category;
