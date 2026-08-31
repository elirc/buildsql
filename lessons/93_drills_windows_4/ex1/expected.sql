SELECT id, name, department, salary,
       ntile(4) OVER (PARTITION BY department ORDER BY salary DESC, id) AS quartile
FROM staff
ORDER BY department, quartile, id;
