SELECT DISTINCT ON (category) category, name, price
FROM products
ORDER BY category, price, id;
