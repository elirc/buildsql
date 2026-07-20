SELECT id, name, price FROM (
  SELECT id, name, price,
         row_number() OVER (ORDER BY price DESC, id) AS rn
  FROM products) t
WHERE rn BETWEEN 11 AND 20
ORDER BY price DESC, id;
