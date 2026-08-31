WITH ranked AS (
  SELECT category, id, name, price,
         dense_rank() OVER (PARTITION BY category
                            ORDER BY price DESC) AS dr
  FROM products)
SELECT category, id, name, price
FROM ranked
WHERE dr <= 2
ORDER BY category ASC, price DESC, id ASC;
