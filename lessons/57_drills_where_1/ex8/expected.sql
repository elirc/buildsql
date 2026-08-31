SELECT id, name, category, price
FROM products
WHERE category IN ('toys', 'books')
  AND price NOT BETWEEN 50 AND 450;
