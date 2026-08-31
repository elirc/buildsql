SELECT p.id, p.name
FROM products AS p
WHERE p.category = 'toys'
  AND position('Doll' IN p.name) = 0;
