WITH company AS (
    SELECT sum(salary) AS payroll, avg(salary) AS avg_salary
    FROM staff
), per_dept AS (
    SELECT department, count(*) AS headcount, sum(salary) AS payroll
    FROM staff
    GROUP BY department
), above AS (
    SELECT s.department, count(*) AS above_company_avg
    FROM staff s
    CROSS JOIN company c
    WHERE s.salary > c.avg_salary
    GROUP BY s.department
)
SELECT d.department,
       d.headcount,
       round(d.payroll, 2) AS payroll,
       round(100 * d.payroll / c.payroll, 2) AS pct_of_payroll,
       coalesce(a.above_company_avg, 0) AS above_company_avg
FROM per_dept d
CROSS JOIN company c
LEFT JOIN above a ON a.department = d.department
ORDER BY d.department;
