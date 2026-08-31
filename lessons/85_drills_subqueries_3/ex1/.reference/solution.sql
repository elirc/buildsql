SELECT s.id, s.name, s.salary, round(ceo.salary - s.salary, 2) AS below_ceo
FROM staff s
CROSS JOIN (SELECT salary FROM staff WHERE manager_id IS NULL) AS ceo
WHERE s.department = 'engineering'
ORDER BY s.id;
