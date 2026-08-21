SELECT id, name
FROM products
WHERE attributes @> '{"color": "red", "size": "xl"}';
