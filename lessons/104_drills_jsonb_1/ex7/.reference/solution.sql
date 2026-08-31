SELECT category,
       count(id) AS products,
       to_jsonb(array_agg(name ORDER BY id)) AS names
FROM products
WHERE id <= 30
GROUP BY 1
ORDER BY 1;
