SELECT s.id, s.name, s.department
FROM staff s
WHERE s.id NOT IN (SELECT manager_id FROM staff WHERE manager_id IS NOT NULL);
