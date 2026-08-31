WITH ranked AS (
  SELECT category, id, name, price,
         row_number() OVER (PARTITION BY category
                            ORDER BY price DESC, id ASC) AS rn
  FROM products)
SELECT category, id, name, price
FROM ranked
WHERE rn = 2
ORDER BY category;
