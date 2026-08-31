SELECT id, name, price
FROM products
ORDER BY price DESC, id ASC
OFFSET 25
LIMIT 25;
