WITH ranked AS (
  SELECT status, id, total,
         row_number() OVER (PARTITION BY status
                            ORDER BY total DESC, id ASC) AS rn
  FROM orders)
SELECT status, id, total
FROM ranked
WHERE rn <= 3
ORDER BY status ASC, total DESC, id ASC;
