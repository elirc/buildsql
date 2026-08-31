SELECT s.id, s.name, s.department, s.salary
FROM staff AS s
WHERE (s.department = 'engineering' OR s.department = 'ops')
  AND s.salary >= 90000
  AND s.salary <= 100000;
