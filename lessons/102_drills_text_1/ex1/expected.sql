SELECT id, name,
       length(name) AS name_len,
       upper(category) AS cat
FROM products
WHERE id <= 20
ORDER BY id;
