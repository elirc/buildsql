SELECT id, name, category, price
FROM products
WHERE (category = 'toys' AND price > 450)
   OR (category = 'books' AND price < 30);
