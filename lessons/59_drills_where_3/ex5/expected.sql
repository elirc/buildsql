SELECT id, name
FROM products
WHERE category = 'toys'
  AND name NOT LIKE '%Doll%';
