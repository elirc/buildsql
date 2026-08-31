SELECT department,
       count(*) AS headcount,
       round(sum(salary), 2) AS payroll,
       round(100 * sum(salary) / (SELECT sum(salary) FROM staff), 2) AS pct_of_payroll,
       count(*) FILTER (WHERE salary > (SELECT avg(salary) FROM staff))
         AS above_company_avg
FROM staff
GROUP BY department
ORDER BY department;
