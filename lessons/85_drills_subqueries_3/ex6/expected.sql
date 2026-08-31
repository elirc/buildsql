SELECT s.id, s.name, s.department, s.salary, s.hired_on
FROM staff s
WHERE s.salary > (SELECT avg(t.salary) FROM staff t
                  WHERE t.department = s.department
                    AND t.hired_on < s.hired_on)
ORDER BY s.id;
