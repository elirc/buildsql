SELECT s.id, s.name, s.department, s.salary
FROM staff AS s
WHERE s.department IN ('engineering');
