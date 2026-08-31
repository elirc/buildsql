SELECT id, name, category, price
FROM products
WHERE category = 'electronics'
  AND (price < 10 OR price > 490);
