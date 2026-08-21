SELECT id, name, price
FROM products
ORDER BY price ASC, id ASC
OFFSET 500
LIMIT 10;
