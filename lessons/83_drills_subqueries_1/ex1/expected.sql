SELECT id, name, price
FROM products
WHERE category = 'toys'
  AND price > (SELECT avg(price) FROM products WHERE category = 'toys')
ORDER BY id;
