SELECT id, name,
       regexp_replace(name, '\s*[0-9]+$', '') AS base_name
FROM products
WHERE id <= 20
ORDER BY id;
