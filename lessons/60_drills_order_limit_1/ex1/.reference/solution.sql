SELECT s.id, s.name, s.hired_on
FROM staff AS s
ORDER BY s.hired_on, s.id
FETCH FIRST 10 ROWS ONLY;
