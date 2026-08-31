SELECT id, name, category, price
FROM products
WHERE (name LIKE '%Router%' OR name LIKE '%Tablet%')
  AND price > 400;
