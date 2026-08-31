WITH ranked AS (
  SELECT department, salary,
         row_number() OVER (PARTITION BY department
                            ORDER BY salary DESC, id) AS rn
  FROM staff)
SELECT department, sum(salary) AS top3_payroll
FROM ranked
WHERE rn <= 3
GROUP BY department
ORDER BY department;
