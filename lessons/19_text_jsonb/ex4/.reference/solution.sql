SELECT id,
       split_part(name, ' ', 1) AS brand
FROM products
WHERE id <= 50;
