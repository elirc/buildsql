SELECT id,
       jsonb_build_object('name', name, 'price', price,
                          'color', attributes->>'color') AS doc
FROM products
WHERE id <= 10
ORDER BY id;
