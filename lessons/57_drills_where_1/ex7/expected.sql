SELECT id, name, department, salary
FROM staff
WHERE department IN ('engineering', 'ops')
  AND salary BETWEEN 90000 AND 100000;
