SELECT s.id, s.name, s.hired_on,
       (SELECT t.salary FROM staff t
        WHERE t.department = s.department
          AND (t.hired_on, t.id) < (s.hired_on, s.id)
        ORDER BY t.hired_on DESC, t.id DESC
        LIMIT 1) AS previous_hire_salary
FROM staff s
WHERE s.department = 'engineering'
ORDER BY s.id;
