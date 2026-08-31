SELECT p.id, p.name
FROM products AS p
WHERE right(p.name, 1) = '7';
