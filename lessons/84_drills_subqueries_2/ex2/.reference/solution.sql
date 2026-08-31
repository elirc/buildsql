SELECT p.id, p.name, p.price
FROM products p
WHERE p.category = 'toys'
  AND p.price > (SELECT min(price) FROM products
                 WHERE category = 'electronics' AND price > 490)
ORDER BY p.id;
