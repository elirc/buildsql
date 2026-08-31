SELECT p.id, p.name, p.category
FROM products AS p
WHERE left(p.name, 5) = 'Nova ';
