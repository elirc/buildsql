WITH sized AS (
  SELECT attributes ->> 'size' AS size, id, name, price,
         row_number() OVER (PARTITION BY attributes ->> 'size'
                            ORDER BY price ASC, id ASC) AS rn
  FROM products
  WHERE category = 'clothing')
SELECT size, id, name, price
FROM sized
WHERE rn = 1
ORDER BY size;
