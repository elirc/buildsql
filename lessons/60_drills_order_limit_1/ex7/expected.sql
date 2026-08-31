SELECT id, name, price
FROM products
ORDER BY price % 1 DESC, id ASC
LIMIT 20;
