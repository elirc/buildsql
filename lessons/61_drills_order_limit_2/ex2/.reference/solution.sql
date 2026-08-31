SELECT s.id, s.name, s.department, s.salary
FROM staff AS s
ORDER BY s.salary DESC, s.id
FETCH FIRST 5 ROWS ONLY;
