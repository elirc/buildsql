SELECT s.id, s.name, s.department, s.salary, s.hired_on
FROM staff s
JOIN staff t ON t.department = s.department AND t.hired_on < s.hired_on
GROUP BY s.id, s.name, s.department, s.salary, s.hired_on
HAVING s.salary > avg(t.salary)
ORDER BY s.id;
