SELECT category,
       count(id) AS products,
       array_to_string(array_agg(name ORDER BY id), ', ') AS names
FROM products
WHERE id <= 60
GROUP BY 1
ORDER BY 1;
