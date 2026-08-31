SELECT id, name,
       (regexp_match(name, '([0-9]+)$'))[1] AS trailing_number
FROM products
WHERE id <= 20
ORDER BY 1;
