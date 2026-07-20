WITH ranked AS (
    SELECT department, name, salary,
           rank() OVER (PARTITION BY department
                        ORDER BY salary DESC) AS r
    FROM staff
)
SELECT department, name, salary
FROM ranked
WHERE r <= 3;
