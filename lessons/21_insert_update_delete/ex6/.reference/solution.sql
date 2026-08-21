UPDATE products
SET price = 9.99
WHERE id IN (11, 22, 33)
RETURNING id, name, price;
