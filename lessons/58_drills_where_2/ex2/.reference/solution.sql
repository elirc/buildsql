SELECT s.id, s.name, s.department, s.salary
FROM staff AS s
WHERE NOT (s.department <> 'engineering' AND s.salary <= 200000);
