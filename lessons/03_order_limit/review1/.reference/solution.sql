SELECT id, name, price
FROM products
WHERE category = 'food'
ORDER BY price, id
LIMIT 5;
