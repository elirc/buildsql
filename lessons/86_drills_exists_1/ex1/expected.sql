SELECT s.id, s.name, s.salary,
       EXISTS (SELECT 1 FROM staff r WHERE r.manager_id = s.id) AS manages
FROM staff s
WHERE s.department = 'sales'
ORDER BY s.id;
