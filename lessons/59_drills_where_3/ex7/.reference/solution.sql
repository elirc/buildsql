SELECT p.id, p.name, p.category, p.price
FROM products AS p
WHERE p.name ~ '(Router|Tablet)'
  AND p.price > 400;
