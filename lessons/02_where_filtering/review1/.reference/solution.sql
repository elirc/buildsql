SELECT id, name, price
FROM products
WHERE category = 'toys'
  AND price BETWEEN 10 AND 20;
