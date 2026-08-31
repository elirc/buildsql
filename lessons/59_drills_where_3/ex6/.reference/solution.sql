SELECT p.id, p.name, p.price
FROM products AS p
WHERE starts_with(p.name, 'Frost ')
  AND p.price >= 100
  AND p.price <= 200;
