WITH avgs AS (
    SELECT department, avg(salary) AS avg_salary
    FROM staff
    GROUP BY department
)
SELECT DISTINCT ON (s.department)
       s.department, s.name, s.salary, round(a.avg_salary, 2) AS avg_salary
FROM staff s
JOIN avgs a ON a.department = s.department
ORDER BY s.department, abs(s.salary - a.avg_salary), s.id;
