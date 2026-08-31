SELECT id, name, price
FROM products
WHERE price > (SELECT avg(price) * 1.9 FROM products)
ORDER BY id;
