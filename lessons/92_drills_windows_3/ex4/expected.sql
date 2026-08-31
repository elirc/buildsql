SELECT id, name, department, salary,
       round(sum(salary) OVER (ORDER BY department), 2) AS running_by_department,
       round(sum(salary) OVER (ORDER BY department, id), 2) AS running_by_row
FROM staff
ORDER BY department, id;
