SELECT d.department,
       (SELECT s.name FROM staff s
        WHERE s.department = d.department
        ORDER BY abs(s.salary - d.avg_salary), s.id
        LIMIT 1) AS most_typical,
       (SELECT s.salary FROM staff s
        WHERE s.department = d.department
        ORDER BY abs(s.salary - d.avg_salary), s.id
        LIMIT 1) AS typical_salary,
       round(d.avg_salary, 2) AS avg_salary
FROM (SELECT department, avg(salary) AS avg_salary
      FROM staff
      GROUP BY department) d
ORDER BY d.department;
