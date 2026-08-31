SELECT p.id, p.name, p.price
FROM products AS p
ORDER BY p.price DESC, p.id
LIMIT 25 OFFSET 25;
