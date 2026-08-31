WITH ranked AS (
  SELECT department, name, hired_on, id,
         row_number() OVER (PARTITION BY department
                            ORDER BY hired_on DESC, id) AS rn
  FROM staff)
SELECT department, name, hired_on
FROM ranked
WHERE rn <= 3
ORDER BY department, hired_on DESC, id;
