SELECT p.id, p.name, p.price
FROM products AS p
WHERE p.price < 20
  AND p.category = 'garden';
