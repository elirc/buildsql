WITH ranked AS (
  SELECT department, name, salary, id,
         row_number() OVER (PARTITION BY department
                            ORDER BY salary DESC, id ASC) AS rn,
         count(*) OVER (PARTITION BY department) AS n
  FROM staff)
SELECT department, name, salary
FROM ranked
WHERE rn = (n + 1) / 2
ORDER BY department;
