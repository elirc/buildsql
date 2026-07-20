SELECT id, name FROM products
WHERE attributes @> '{"tags": ["eco"]}';
