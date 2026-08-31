SELECT id, name, price
FROM products
WHERE name LIKE 'Frost %'
  AND price BETWEEN 100 AND 200;
