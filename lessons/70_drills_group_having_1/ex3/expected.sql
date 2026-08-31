SELECT department,
       count(*) AS headcount,
       round(avg(salary), 2) AS avg_salary,
       max(salary) AS top_salary
FROM staff
GROUP BY department
ORDER BY department;
