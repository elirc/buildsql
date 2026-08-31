SELECT id, name, hired_on, previous_hire_salary
FROM (SELECT s.id, s.name, s.hired_on, s.department,
             lag(s.salary) OVER (PARTITION BY s.department
                                 ORDER BY s.hired_on, s.id) AS previous_hire_salary
      FROM staff s) t
WHERE t.department = 'engineering'
ORDER BY t.id;
