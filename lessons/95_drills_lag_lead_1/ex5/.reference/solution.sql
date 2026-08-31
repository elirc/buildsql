WITH pricey AS (
  SELECT category, id, price
  FROM products
  WHERE price >= 495)
SELECT category, id, price,
       lag(price) OVER (PARTITION BY category ORDER BY price, id) AS prev_in_cat
FROM pricey
ORDER BY category, price, id;
