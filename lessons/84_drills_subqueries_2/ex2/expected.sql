SELECT id, name, price
FROM products
WHERE category = 'toys'
  AND price > ANY (SELECT price FROM products
                   WHERE category = 'electronics' AND price > 490)
ORDER BY id;
