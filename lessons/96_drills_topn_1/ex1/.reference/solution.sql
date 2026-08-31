WITH ranked AS (
  SELECT id, name, price,
         row_number() OVER (ORDER BY price, id) AS rn
  FROM products
  WHERE category = 'food')
SELECT id, name, price
FROM ranked
WHERE rn <= 10
ORDER BY price, id;
