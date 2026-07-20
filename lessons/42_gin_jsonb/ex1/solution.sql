SELECT id
FROM products
WHERE attributes @> '{"tags": ["eco", "limited"]}';
