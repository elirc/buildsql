SELECT DISTINCT ON (attributes ->> 'size')
       attributes ->> 'size' AS size, id, name, price
FROM products
WHERE category = 'clothing'
ORDER BY attributes ->> 'size', price ASC, id ASC;
