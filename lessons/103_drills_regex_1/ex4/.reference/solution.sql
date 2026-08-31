SELECT id, name,
       btrim(regexp_replace(name, '[0-9]+$', '')) AS base_name
FROM products
WHERE id <= 20
ORDER BY 1;
