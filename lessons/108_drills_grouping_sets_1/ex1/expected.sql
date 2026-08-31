SELECT department, count(*) AS headcount
FROM staff
GROUP BY ROLLUP (department)
ORDER BY department;
