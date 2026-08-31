SELECT s.id, s.name, s.department, s.hired_on
FROM staff AS s
ORDER BY s.department, s.hired_on DESC, s.id
FETCH FIRST 25 ROWS ONLY;
