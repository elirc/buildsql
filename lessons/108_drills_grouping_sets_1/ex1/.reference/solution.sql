SELECT department, count(*) AS headcount
FROM staff
GROUP BY GROUPING SETS ((department), ())
ORDER BY department;
