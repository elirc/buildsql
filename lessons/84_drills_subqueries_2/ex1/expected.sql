SELECT id, name, department, salary
FROM staff
WHERE salary > ALL (SELECT salary FROM staff
                    WHERE department = 'engineering' AND salary < 60000)
ORDER BY id;
