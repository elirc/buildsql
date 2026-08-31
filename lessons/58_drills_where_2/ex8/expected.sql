SELECT id, name, category, price
FROM products
WHERE NOT (category IN ('books', 'food') OR price BETWEEN 100 AND 400);
