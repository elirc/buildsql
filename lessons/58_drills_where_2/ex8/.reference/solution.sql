SELECT p.id, p.name, p.category, p.price
FROM products AS p
WHERE p.category NOT IN ('books', 'food')
  AND (p.price < 100 OR p.price > 400);
