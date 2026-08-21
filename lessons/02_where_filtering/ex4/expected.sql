SELECT id, name, category, price
FROM products
WHERE category IN ('toys', 'garden')
  AND price BETWEEN 100 AND 150;
