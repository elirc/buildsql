SELECT id, name, category, price
FROM (SELECT id, name, category, price,
             avg(price) OVER (PARTITION BY category) AS avg_price
      FROM products) t
WHERE category IN ('books', 'electronics')
  AND price > avg_price
ORDER BY category, id;
