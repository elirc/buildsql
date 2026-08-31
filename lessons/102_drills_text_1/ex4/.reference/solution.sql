SELECT id,
       concat(name, ' (', category, ') costs ', price) AS label
FROM products
WHERE id <= 15
ORDER BY 1;
