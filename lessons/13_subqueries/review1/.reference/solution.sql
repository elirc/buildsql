SELECT s.id, s.name
FROM staff s
WHERE s.salary > (SELECT avg(s2.salary)
                  FROM staff s2
                  WHERE s2.department = s.department);
