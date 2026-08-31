SELECT round(sum(salary), 2) AS payroll,
       round(avg(salary), 2) AS avg_salary,
       max(salary) AS top_salary,
       min(hired_on) AS first_hire,
       count(*) FILTER (WHERE manager_id IS NULL) AS rootless
FROM staff;
