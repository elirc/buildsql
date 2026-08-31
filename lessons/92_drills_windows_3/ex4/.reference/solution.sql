SELECT id, name, department, salary,
       round(sum(salary) OVER (ORDER BY department
                               RANGE BETWEEN UNBOUNDED PRECEDING
                                         AND CURRENT ROW), 2)
         AS running_by_department,
       round(sum(salary) OVER (ORDER BY department, id
                               ROWS BETWEEN UNBOUNDED PRECEDING
                                        AND CURRENT ROW), 2)
         AS running_by_row
FROM staff
ORDER BY department, id;
