SELECT s.id, s.name, s.department, s.salary
FROM staff s
WHERE NOT EXISTS (SELECT 1 FROM staff t
                  WHERE t.department = 'engineering'
                    AND t.salary < 60000
                    AND t.salary >= s.salary)
ORDER BY s.id;
