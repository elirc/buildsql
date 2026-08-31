SELECT round(sum(salary), 2) AS payroll,
       round(avg(salary), 2) AS avg_salary,
       max(salary) AS top_salary,
       min(hired_on) AS first_hire,
       count(*) - count(manager_id) AS rootless
FROM staff;
