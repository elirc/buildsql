SELECT id, name,
       substring(name FROM '[0-9]+$') AS trailing_number
FROM products
WHERE id <= 20
ORDER BY id;
