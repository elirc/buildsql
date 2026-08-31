SELECT p.id, p.name, p.category, p.price
FROM products AS p
WHERE p.category = 'electronics'
  AND p.price NOT BETWEEN 10 AND 490;
