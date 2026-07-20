SELECT id, name
FROM products
WHERE attributes ->> 'color' = 'red'
  AND attributes ->> 'size' = 'xl';
