SELECT 'gift' AS label, name
FROM products
WHERE category = 'toys' AND price < 20
UNION ALL
SELECT 'snack', name
FROM products
WHERE category = 'food' AND price < 10;
