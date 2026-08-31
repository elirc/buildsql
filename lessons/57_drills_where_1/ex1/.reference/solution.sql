SELECT p.id, p.name, p.price
FROM products AS p
WHERE NOT (p.price >= 5);
