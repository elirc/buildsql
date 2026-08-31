SELECT category,
       count(*) AS products,
       jsonb_agg(name ORDER BY id) AS names
FROM products
WHERE id <= 30
GROUP BY category
ORDER BY category;
