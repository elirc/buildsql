SELECT p.id, p.name, p.category, p.price
FROM products AS p
WHERE p.category IN ('toys', 'books')
  AND (p.price < 50 OR p.price > 450);
