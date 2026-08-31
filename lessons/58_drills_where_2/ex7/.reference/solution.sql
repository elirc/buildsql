SELECT p.id, p.name, p.category, p.price
FROM products AS p
WHERE (p.category = 'toys' AND NOT (p.price <= 450))
   OR (p.category = 'books' AND NOT (p.price >= 30));
