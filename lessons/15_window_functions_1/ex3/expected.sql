SELECT category, name, price FROM (
  SELECT category, name, price, id,
         row_number() OVER (PARTITION BY category ORDER BY price DESC, id) AS rn
  FROM products) t
WHERE rn <= 5
ORDER BY category, price DESC, id;
