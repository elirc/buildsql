SELECT id,
       format('%s (%s) costs %s', name, category, price) AS label
FROM products
WHERE id <= 15
ORDER BY id;
