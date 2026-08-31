SELECT p.id, p.name, p.price
FROM products AS p
WHERE lower(p.name) LIKE '%blanket%';
