SELECT id, name
FROM products
WHERE id <= 200
  AND attributes->'tags' ? 'premium'
ORDER BY id;
