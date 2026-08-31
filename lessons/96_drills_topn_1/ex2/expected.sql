WITH ranked AS (
  SELECT country, id, name, created_at,
         row_number() OVER (PARTITION BY country
                            ORDER BY created_at DESC, id DESC) AS rn
  FROM customers)
SELECT country, id, name, created_at
FROM ranked
WHERE rn = 1
ORDER BY country;
