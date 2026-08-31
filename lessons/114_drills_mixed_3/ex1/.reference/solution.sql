SELECT department,
       sum(salary) AS payroll,
       round(100.0 * sum(salary) / (SELECT sum(salary) FROM staff), 1) AS payroll_pct
FROM staff
GROUP BY department
ORDER BY department;
